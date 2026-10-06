<?php

namespace Database\Seeders;

use App\Support\Rbac\RbacBootstrap;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates the four roles (Super Admin, Admin, Staff, Customer) and the
     * permissions each starts with. Staff start with the dashboard only: a
     * Super Admin or Admin grants each staff member exactly the permissions
     * they need. Existing grants are never removed, so this is safe to re-run.
     */
    public function run(): void
    {
        RbacBootstrap::ensureRolesAndPermissions();
    }
}
