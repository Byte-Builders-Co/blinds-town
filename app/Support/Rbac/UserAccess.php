<?php

namespace App\Support\Rbac;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;

/**
 * Who may manage whom. A user can only manage people ranked below them, so an
 * Admin can never touch a Super Admin and Staff can never touch an Admin.
 * A Super Admin outranks everyone but is still protected from removing the
 * last Super Admin. These rules are enforced on the server for every request.
 *
 * They deliberately live here rather than in a Policy: the application-wide
 * "Super Admin can do anything" Gate bypass would skip a Policy entirely.
 */
final class UserAccess
{
    /**
     * Roles whose users the actor may see and manage.
     *
     * @return list<UserRole>
     */
    public static function manageableRoles(User $actor): array
    {
        $own = UserRole::highestFor($actor);

        if ($own === null) {
            return [];
        }

        return array_values(array_filter(
            UserRole::cases(),
            fn (UserRole $role) => $own === UserRole::SuperAdmin || $role->rank() < $own->rank(),
        ));
    }

    /**
     * Roles the actor may hand out when creating or editing a user.
     *
     * @return list<UserRole>
     */
    public static function assignableRoles(User $actor): array
    {
        return self::manageableRoles($actor);
    }

    public static function canManage(User $actor, User $target): bool
    {
        // A user with no role at all is treated as the lowest rank.
        $targetRole = UserRole::highestFor($target) ?? UserRole::Customer;

        return in_array($targetRole, self::manageableRoles($actor), true);
    }

    public static function canAssign(User $actor, UserRole $role): bool
    {
        return in_array($role, self::assignableRoles($actor), true);
    }

    /**
     * Permissions the actor may grant to another person: only ones they hold
     * themselves, and never the Super Admin-only ones.
     *
     * @return list<string>
     */
    public static function grantablePermissions(User $actor): array
    {
        if ($actor->isSuperAdmin()) {
            return PermissionCatalog::assignable();
        }

        $held = $actor->getAllPermissions()->pluck('name')->all();

        return array_values(array_intersect(PermissionCatalog::assignable(), $held));
    }

    public static function isLastActiveSuperAdmin(User $user): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        return User::role(UserRole::SuperAdmin->value)
            ->where('status', UserStatus::Active->value)
            ->where('users.id', '!=', $user->id)
            ->doesntExist();
    }
}
