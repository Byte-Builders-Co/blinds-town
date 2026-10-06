<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCmsPageRequest;
use App\Http\Requests\Admin\UpdateCmsPageRequest;
use App\Models\CmsPage;
use App\Support\HtmlSanitizer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manages the rich-text content pages (Privacy, Terms, Shipping, Return &
 * Refund and any page added here). Section-based pages such as the homepage
 * and contact page have their own structure, and the About Us page is
 * deliberately not managed here. Pages marked "show in footer" are linked from
 * the storefront footer automatically.
 */
class CmsPageController extends Controller
{
    /** Pages that exist on the storefront but are not editable from this screen. */
    private const EXCLUDED_SLUGS = ['about'];

    public function index(): Response
    {
        return Inertia::render('admin/cms-pages/index', [
            'pages' => CmsPage::query()
                ->whereNull('sections')
                ->whereNotIn('slug', self::EXCLUDED_SLUGS)
                ->orderBy('title')
                ->get(['id', 'slug', 'title', 'is_active', 'show_in_footer', 'updated_at'])
                ->append('public_url'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/cms-pages/create', [
            'nextFooterOrder' => (int) CmsPage::query()->max('footer_order') + 1,
        ]);
    }

    public function store(StoreCmsPageRequest $request): RedirectResponse
    {
        $page = CmsPage::query()->create([
            ...$request->safe()->except(['content', 'footer_order']),
            'content' => HtmlSanitizer::clean((string) $request->validated('content')),
            'footer_order' => $request->validated('footer_order') ?? (int) CmsPage::query()->max('footer_order') + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$page->title} created."]);

        return redirect()->route('admin.cms-pages.index');
    }

    public function edit(CmsPage $page): Response
    {
        abort_unless($this->isEditable($page), 404);

        return Inertia::render('admin/cms-pages/edit', [
            'page' => $page->append('public_url'),
        ]);
    }

    public function update(UpdateCmsPageRequest $request, CmsPage $page): RedirectResponse
    {
        abort_unless($this->isEditable($page), 404);

        $page->update([
            ...$request->safe()->except(['content', 'footer_order']),
            'content' => HtmlSanitizer::clean((string) $request->validated('content')),
            'footer_order' => $request->validated('footer_order') ?? $page->footer_order,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$page->title} updated."]);

        return redirect()->route('admin.cms-pages.edit', $page);
    }

    public function destroy(CmsPage $page): RedirectResponse
    {
        abort_unless($this->isEditable($page), 404);

        $page->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$page->title} deleted."]);

        return redirect()->route('admin.cms-pages.index');
    }

    private function isEditable(CmsPage $page): bool
    {
        return $page->sections === null && ! in_array($page->slug, self::EXCLUDED_SLUGS, true);
    }
}
