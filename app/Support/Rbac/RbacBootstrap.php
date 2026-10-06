<?php

namespace App\Support\Rbac;

use App\Enums\UserRole;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Brings an existing database up to the four-role model without touching any
 * users, orders or other records. Every step is additive and safe to repeat.
 */
final class RbacBootstrap
{
    /**
     * Creates any missing roles and permissions. A brand-new permission, or a
     * brand-new role, is given to the roles that should start with it; anything
     * that already existed is left exactly as it was, so a permission
     * deliberately taken away from a role is not handed back by a later
     * migration or seed. The only grants ever taken away are Super Admin-only
     * and retired permissions held by other roles. The Super Admin role is
     * always topped up to hold everything, so it cannot be locked out.
     */
    public static function ensureRolesAndPermissions(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $existing = Permission::query()->pluck('name')->all();

        foreach (PermissionCatalog::all() as $permission) {
            Permission::findOrCreate($permission);
        }

        $newPermissions = array_diff(PermissionCatalog::all(), $existing);

        foreach (UserRole::cases() as $userRole) {
            $roleIsNew = ! Role::query()->where('name', $userRole->value)->exists();
            $role = Role::findOrCreate($userRole->value);

            $defaults = PermissionCatalog::defaultsFor($userRole);

            $grant = match (true) {
                $userRole === UserRole::SuperAdmin => $defaults,
                $roleIsNew => $defaults,
                default => array_values(array_intersect($defaults, $newPermissions)),
            };

            $role->givePermissionTo($grant);

            // Super Admin-only and retired permissions belong to no other role,
            // even where an older version had handed one out.
            if ($userRole !== UserRole::SuperAdmin) {
                $role->revokePermissionTo(
                    Permission::query()
                        ->whereIn('name', [...PermissionCatalog::SUPER_ADMIN_ONLY, ...PermissionCatalog::RETIRED])
                        ->pluck('name')
                        ->all(),
                );
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Makes the existing Admin the Super Admin. Only runs while the site has no
     * Super Admin; the longest-standing Admin account is the one upgraded, and
     * it is upgraded in place so its id, credentials and orders are untouched.
     */
    public static function promoteExistingAdmin(): ?User
    {
        if (User::role(UserRole::SuperAdmin->value)->withTrashed()->exists()) {
            return null;
        }

        $admin = User::role(UserRole::Admin->value)->orderBy('id')->first();

        $admin?->syncRoles([UserRole::SuperAdmin->value]);

        return $admin;
    }

    /**
     * Admins used to get every business permission through the Admin role, which
     * made them all-or-nothing. Access is now chosen per person, so whatever the
     * Admin role holds is copied onto each existing Admin and then taken off the
     * role. Every Admin keeps exactly the access they had; from here on it can
     * be adjusted one Admin at a time. Safe to repeat: once the role holds only
     * its defaults there is nothing left to move.
     */
    public static function moveAdminPermissionsToUsers(): void
    {
        $role = Role::query()->where('name', UserRole::Admin->value)->first();

        if ($role === null) {
            return;
        }

        $stay = [
            ...PermissionCatalog::defaultsFor(UserRole::Admin),
            ...PermissionCatalog::SUPER_ADMIN_ONLY,
            ...PermissionCatalog::RETIRED,
        ];

        $moving = $role->permissions->pluck('name')->reject(fn (string $name) => in_array($name, $stay, true))->values()->all();

        if ($moving === []) {
            return;
        }

        // Include removed accounts, so an Admin who is restored later is not left without access.
        User::role(UserRole::Admin->value)->withTrashed()->each(
            fn (User $admin) => $admin->givePermissionTo($moving),
        );

        $role->revokePermissionTo($moving);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Staff used to reach products and orders without any permission. Existing
     * staff keep read-only access to those two modules so nothing disappears
     * on upgrade; anything more is granted per person.
     */
    public static function keepStaffReadAccess(): void
    {
        User::role(UserRole::Staff->value)->each(
            fn (User $staff) => $staff->givePermissionTo(['orders.view', 'products.view']),
        );
    }
}
