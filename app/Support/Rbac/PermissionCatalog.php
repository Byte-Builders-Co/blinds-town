<?php

namespace App\Support\Rbac;

use App\Enums\UserRole;

/**
 * The single list of permissions and which role starts with which, shared by
 * the seeder, the data migration and the user form (where Staff are given their
 * modules) so they can never drift apart.
 *
 * Every permission listed here must actually protect something: a test checks
 * that each one is required by at least one route, so the checkboxes on the
 * user form always do what their label says.
 */
final class PermissionCatalog
{
    /**
     * Permissions that only a Super Admin may hold. They are never offered to
     * any other role or user, so privilege cannot be escalated through them.
     *
     * @var list<string>
     */
    public const SUPER_ADMIN_ONLY = ['activity_logs.view'];

    /**
     * Permissions that older versions created but nothing uses any more. They
     * are never offered, and are taken away from every role except Super Admin.
     *
     * @var list<string>
     */
    public const RETIRED = ['roles.view', 'roles.edit', 'inventory.view', 'inventory.manage'];

    /**
     * Permissions grouped by the module they unlock, for display.
     *
     * @return array<string, list<string>>
     */
    public static function groups(): array
    {
        return [
            'Dashboard' => ['dashboard.view'],
            'Products' => ['products.view', 'products.create', 'products.edit', 'products.delete'],
            'Categories' => ['categories.view', 'categories.create', 'categories.edit', 'categories.delete'],
            'Orders' => ['orders.view', 'orders.update_status', 'orders.refund'],
            'Customers & Users' => ['users.view', 'users.create', 'users.edit', 'users.delete'],
            'Offers & Discounts' => ['coupons.view', 'coupons.manage'],
            'Product Reviews' => ['reviews.view', 'reviews.moderate'],
            'Reports' => ['reports.view'],
            'Content' => ['cms.view', 'cms.manage'],
            'Settings' => ['settings.view', 'settings.manage'],
            'Activity Log' => self::SUPER_ADMIN_ONLY,
        ];
    }

    /**
     * What each group covers, in plain words, for the user form.
     *
     * @return array<string, string>
     */
    public static function groupDescriptions(): array
    {
        return [
            'Dashboard' => 'The landing page with sales figures, charts and recent orders.',
            'Products' => 'The product catalogue: details, prices, images, options and stock status.',
            'Categories' => 'Product categories and sub-categories.',
            'Orders' => 'Customer orders, delivery tracking and refunds.',
            'Customers & Users' => 'The Customer and Users screens. People can only manage accounts ranked below them.',
            'Offers & Discounts' => 'Coupon codes.',
            'Product Reviews' => 'Customer product reviews and their photos.',
            'Reports' => 'Sales, orders, revenue, product and customer reports.',
            'Content' => 'Content Pages (Privacy, Terms, Shipping, Returns and any page you add) and the FAQs.',
            'Settings' => 'Website Configuration, Email Notifications and Basic Store Settings (business info, GST / tax, shipping, payment).',
            'Activity Log' => 'The record of who changed what. Super Admin only.',
        ];
    }

    /**
     * A plain-language label for every permission.
     *
     * @return array<string, string>
     */
    public static function labels(): array
    {
        return [
            'dashboard.view' => 'View the dashboard',
            'products.view' => 'View products',
            'products.create' => 'Add products',
            'products.edit' => 'Edit products',
            'products.delete' => 'Delete products',
            'categories.view' => 'View categories',
            'categories.create' => 'Add categories',
            'categories.edit' => 'Edit categories',
            'categories.delete' => 'Delete categories',
            'orders.view' => 'View orders',
            'orders.update_status' => 'Update order status & tracking',
            'orders.refund' => 'Issue refunds',
            'users.view' => 'View customers & users',
            'users.create' => 'Add customers & users',
            'users.edit' => 'Edit customers & users',
            'users.delete' => 'Delete customers & users',
            'coupons.view' => 'View coupons',
            'coupons.manage' => 'Create, edit & delete coupons',
            'reviews.view' => 'View reviews',
            'reviews.moderate' => 'Approve, reject, hide & delete reviews',
            'reports.view' => 'View reports',
            'cms.view' => 'View content pages & FAQs',
            'cms.manage' => 'Add, edit & delete content pages & FAQs',
            'settings.view' => 'View store settings',
            'settings.manage' => 'Change store settings',
            'activity_logs.view' => 'View activity logs',
        ];
    }

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return array_merge(...array_values(self::groups()));
    }

    /**
     * Permissions that may be granted to Admin, Staff or an individual user.
     *
     * @return list<string>
     */
    public static function assignable(): array
    {
        return array_values(array_diff(self::all(), self::SUPER_ADMIN_ONLY));
    }

    /**
     * What each role starts with. Admin and Staff both start with the dashboard
     * only: a Super Admin gives each Admin, and an Admin or Super Admin gives
     * each Staff member, the modules they need when creating or editing the
     * user. That keeps every person's access visible and adjustable one by one.
     *
     * @return list<string>
     */
    public static function defaultsFor(UserRole $role): array
    {
        return match ($role) {
            UserRole::SuperAdmin => self::all(),
            UserRole::Admin, UserRole::Staff => ['dashboard.view'],
            UserRole::Customer => [],
        };
    }
}
