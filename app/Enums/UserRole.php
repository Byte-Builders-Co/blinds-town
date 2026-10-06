<?php

namespace App\Enums;

use App\Models\User;

/**
 * The four roles of the application, highest authority first.
 *
 * The backing value is the role name stored by spatie/laravel-permission.
 */
enum UserRole: string
{
    case SuperAdmin = 'super-admin';
    case Admin = 'admin';
    case Staff = 'staff';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::Staff => 'Staff',
            self::Customer => 'Customer',
        };
    }

    /**
     * The title shown for the area of the site this role works in.
     */
    public function panelLabel(): string
    {
        return match ($this) {
            self::Customer => 'Customer Account',
            default => "{$this->label()} Panel",
        };
    }

    /**
     * Higher numbers outrank lower ones: Super Admin > Admin > Staff > Customer.
     */
    public function rank(): int
    {
        return match ($this) {
            self::SuperAdmin => 4,
            self::Admin => 3,
            self::Staff => 2,
            self::Customer => 1,
        };
    }

    /**
     * The highest role a user holds, or null when they have none.
     */
    public static function highestFor(User $user): ?self
    {
        $roles = $user->getRoleNames();

        $held = array_filter(self::cases(), fn (self $role) => $roles->contains($role->value));

        usort($held, fn (self $a, self $b) => $b->rank() <=> $a->rank());

        return $held[0] ?? null;
    }
}
