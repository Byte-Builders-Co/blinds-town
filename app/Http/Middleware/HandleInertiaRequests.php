<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\CmsPage;
use App\Models\User;
use App\Services\CartResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Middleware;
use Spatie\Permission\Models\Permission;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'roles' => fn () => $request->user()?->getRoleNames() ?? [],
                // A Super Admin passes every permission check, so the UI is told they hold all of them.
                'permissions' => fn () => $this->permissionsFor($request->user()),
                'role' => fn () => $this->roleFor($request->user()),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'cart' => [
                'count' => fn () => app(CartResolver::class)->resolve($request)->itemCount(),
            ],
            'navCategories' => fn () => Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->where('show_in_menu', true)
                ->orderBy('sort_order')
                ->limit(8)
                ->get(['id', 'name', 'slug']),
            // The links in the storefront footer's "Information" column.
            'footerPages' => fn () => CmsPage::query()->inFooter()->get(['slug', 'title'])
                ->map(fn (CmsPage $page) => ['title' => $page->title, 'url' => $page->public_url])
                ->all(),
            'contactInfo' => fn () => CmsPage::query()->where('slug', 'contact')->first()?->sections,
        ];
    }

    /**
     * @return Collection<int, string>|list<never>
     */
    private function permissionsFor(?User $user): Collection|array
    {
        if ($user === null) {
            return [];
        }

        return $user->isSuperAdmin()
            ? Permission::query()->pluck('name')
            : $user->getAllPermissions()->pluck('name');
    }

    /**
     * The user's highest role, for the role label shown in the interface.
     *
     * @return array{value: string, label: string, panel: string}|null
     */
    private function roleFor(?User $user): ?array
    {
        $role = $user?->highestRole();

        return $role === null ? null : [
            'value' => $role->value,
            'label' => $role->label(),
            'panel' => $role->panelLabel(),
        ];
    }
}
