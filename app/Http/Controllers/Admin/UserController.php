<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveUserRequest;
use App\Models\ActivityLog;
use App\Models\User;
use App\Support\Rbac\PermissionCatalog;
use App\Support\Rbac\UserAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Create, edit and remove Super Admin, Admin, Staff and Customer accounts.
 *
 * Every action is limited by rank: you can only see and change people ranked
 * below you (a Super Admin sees everyone), and you can only hand out roles and
 * permissions you are allowed to give. The Super Admin can never be removed or
 * demoted by anyone ranked below them, and the last active one is protected.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $actor = $request->user();
        $roles = UserAccess::manageableRoles($actor);

        $users = User::query()
            ->with('roles:id,name')
            ->where(function ($query) use ($roles) {
                $query->whereHas('roles', fn ($q) => $q->whereIn('name', array_map(fn (UserRole $role) => $role->value, $roles)));

                // People with no role at all count as customers.
                if (in_array(UserRole::Customer, $roles, true)) {
                    $query->orWhereDoesntHave('roles');
                }
            })
            ->when($request->string('role')->toString(), fn ($query, $role) => $query->whereHas('roles', fn ($q) => $q->where('name', $role)))
            ->when($request->string('search')->toString(), fn ($query, $search) => $query->where(fn ($q) => $q
                ->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'mobile_number' => $user->mobile_number,
                'status' => $user->status->value,
                'role' => $this->roleSummary($user),
                'last_login_at' => $user->last_login_at?->toIso8601String(),
                'is_self' => $user->is($actor),
                'can_delete' => ! $user->is($actor) && ! UserAccess::isLastActiveSuperAdmin($user) && $actor->can('users.delete'),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only('search', 'role'),
            'roles' => $this->roleOptions(UserAccess::manageableRoles($actor)),
        ]);
    }

    public function create(Request $request): Response
    {
        $actor = $request->user();

        return Inertia::render('admin/users/create', [
            'roles' => $this->roleOptions(UserAccess::assignableRoles($actor)),
            'statuses' => UserStatus::cases(),
            'permissionGroups' => $this->grantableGroups($actor),
            'permissionLabels' => PermissionCatalog::labels(),
            'groupDescriptions' => PermissionCatalog::groupDescriptions(),
        ]);
    }

    public function store(SaveUserRequest $request): RedirectResponse
    {
        $actor = $request->user();
        $role = UserRole::from($request->validated('role'));

        // Never trust the form: handing out a role above your own is refused outright.
        abort_unless(UserAccess::canAssign($actor, $role), 403);

        $user = User::query()->create([
            ...$request->safe()->only(['first_name', 'last_name', 'email', 'mobile_number', 'status']),
            'password' => $request->validated('password'),
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();
        $user->assignRole($role->value);

        $this->syncDirectPermissions($actor, $user, $role, $request->validated('permissions', []));

        ActivityLog::record(
            'created',
            $user,
            "{$actor->highestRole()?->label()} {$actor->name} created {$role->label()} {$user->name}",
            ['role' => $role->value],
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$user->name} created."]);

        return redirect()->route('admin.users.index');
    }

    public function edit(Request $request, User $user): Response
    {
        $actor = $request->user();

        abort_unless(UserAccess::canManage($actor, $user), 403);

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'mobile_number' => $user->mobile_number,
                'status' => $user->status->value,
                'role' => $user->highestRole()?->value ?? UserRole::Customer->value,
                'permissions' => $user->getDirectPermissions()->pluck('name')->values(),
            ],
            'isSelf' => $user->is($actor),
            'isLastSuperAdmin' => UserAccess::isLastActiveSuperAdmin($user),
            'roles' => $this->roleOptions(UserAccess::assignableRoles($actor)),
            'statuses' => UserStatus::cases(),
            'permissionGroups' => $this->grantableGroups($actor),
            'permissionLabels' => PermissionCatalog::labels(),
            'groupDescriptions' => PermissionCatalog::groupDescriptions(),
        ]);
    }

    public function update(SaveUserRequest $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        $role = UserRole::from($request->validated('role'));
        $currentRole = $user->highestRole() ?? UserRole::Customer;
        $status = UserStatus::from($request->validated('status'));

        abort_unless(UserAccess::canManage($actor, $user), 403);

        // Nobody may change their own role or lock themselves out.
        if ($user->is($actor)) {
            abort_unless($role === $currentRole && $status === UserStatus::Active, 403);
        }

        // The last active Super Admin keeps their role and stays active.
        if (UserAccess::isLastActiveSuperAdmin($user)) {
            abort_unless($role === UserRole::SuperAdmin && $status === UserStatus::Active, 403);
        }

        if ($role !== $currentRole) {
            abort_unless(UserAccess::canAssign($actor, $role), 403);
        }

        $user->fill($request->safe()->only(['first_name', 'last_name', 'email', 'mobile_number', 'status']));

        if ($request->filled('password')) {
            $user->password = $request->validated('password');
        }

        $user->save();

        if ($role !== $currentRole) {
            $user->syncRoles([$role->value]);

            ActivityLog::record(
                'role_changed',
                $user,
                "{$actor->highestRole()?->label()} {$actor->name} changed {$user->name} from {$currentRole->label()} to {$role->label()}",
                ['from' => $currentRole->value, 'to' => $role->value],
            );
        }

        $this->syncDirectPermissions($actor, $user, $role, $request->validated('permissions', []));

        ActivityLog::record(
            'updated',
            $user,
            "{$actor->highestRole()?->label()} {$actor->name} updated {$role->label()} {$user->name}",
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$user->name} updated."]);

        return redirect()->route('admin.users.index');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();

        abort_unless(UserAccess::canManage($actor, $user), 403);
        abort_if($user->is($actor), 403, 'You cannot delete your own account.');
        abort_if(UserAccess::isLastActiveSuperAdmin($user), 403, 'The last Super Admin cannot be deleted.');

        ActivityLog::record(
            'deleted',
            $user,
            "{$actor->highestRole()?->label()} {$actor->name} deleted {$user->highestRole()?->label()} {$user->name}",
        );

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$user->name} deleted."]);

        return redirect()->route('admin.users.index');
    }

    /**
     * Admins and Staff get their modules as individual permissions. The actor
     * can only switch on or off permissions they themselves may grant;
     * everything else the person already holds is left exactly as it was.
     *
     * @param  list<string>  $requested
     */
    private function syncDirectPermissions(User $actor, User $user, UserRole $role, array $requested): void
    {
        $grantable = UserAccess::grantablePermissions($actor);
        $kept = $user->getDirectPermissions()->pluck('name')->reject(fn (string $name) => in_array($name, $grantable, true));
        // Admins and Staff are given their modules one by one; Super Admins need none, Customers get none.
        $wanted = in_array($role, [UserRole::Admin, UserRole::Staff], true) ? array_values(array_intersect($requested, $grantable)) : [];

        $before = $user->getDirectPermissions()->pluck('name')->sort()->values()->all();

        $user->syncPermissions([...$kept->all(), ...$wanted]);

        $after = $user->getDirectPermissions()->pluck('name')->sort()->values()->all();

        if ($before !== $after) {
            ActivityLog::record(
                'permissions_updated',
                $user,
                "{$actor->highestRole()?->label()} {$actor->name} updated permissions for {$user->name}",
                ['added' => array_values(array_diff($after, $before)), 'removed' => array_values(array_diff($before, $after))],
            );
        }
    }

    /**
     * @param  list<UserRole>  $roles
     * @return list<array{value: string, label: string}>
     */
    private function roleOptions(array $roles): array
    {
        return array_map(fn (UserRole $role) => ['value' => $role->value, 'label' => $role->label()], $roles);
    }

    /**
     * @return array<string, list<string>>
     */
    private function grantableGroups(User $actor): array
    {
        // Every staff member already gets these by role, so ticking them would change nothing.
        $grantable = array_diff(
            UserAccess::grantablePermissions($actor),
            PermissionCatalog::defaultsFor(UserRole::Staff),
        );

        return collect(PermissionCatalog::groups())
            ->map(fn (array $permissions) => array_values(array_intersect($permissions, $grantable)))
            ->filter()
            ->all();
    }

    /**
     * @return array{value: string, label: string}
     */
    private function roleSummary(User $user): array
    {
        $role = $user->highestRole() ?? UserRole::Customer;

        return ['value' => $role->value, 'label' => $role->label()];
    }
}
