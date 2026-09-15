<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'roles.view', 'roles.edit',
            'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
            'inventory.view', 'inventory.manage',
            'coupons.view', 'coupons.manage',
            'reviews.view', 'reviews.moderate',
            'reports.view',
            'cms.view', 'cms.manage',
            'settings.view', 'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $superAdmin = Role::findOrCreate('super-admin');
        $superAdmin->syncPermissions($permissions);

        $admin = Role::findOrCreate('admin');
        $admin->syncPermissions([
            'dashboard.view',
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'roles.view',
            'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
            'inventory.view', 'inventory.manage',
            'coupons.view', 'coupons.manage',
            'reviews.view', 'reviews.moderate',
            'reports.view',
            'cms.view', 'cms.manage',
            'settings.view', 'settings.manage',
        ]);

        // Staff have no default permissions — an admin grants each staff
        // member exactly the permissions they need when creating/editing them.
        $staff = Role::findOrCreate('staff');
        $staff->syncPermissions(['dashboard.view']);

        Role::findOrCreate('customer');
    }
}
