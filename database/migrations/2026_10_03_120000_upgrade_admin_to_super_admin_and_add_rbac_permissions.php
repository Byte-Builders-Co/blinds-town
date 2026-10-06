<?php

use App\Support\Rbac\RbacBootstrap;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * A data upgrade, not a schema change: roles and permissions already live
     * in the spatie/laravel-permission tables. It makes sure the four roles
     * and every permission exist, upgrades the existing Admin account to Super
     * Admin in place (same user, same id, same orders), and keeps existing
     * Staff able to read products and orders. Nothing is deleted, and running
     * it again changes nothing.
     */
    public function up(): void
    {
        RbacBootstrap::ensureRolesAndPermissions();
        RbacBootstrap::promoteExistingAdmin();
        RbacBootstrap::keepStaffReadAccess();

        // Make every running process pick up the new roles and permissions straight away.
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     *
     * Intentionally empty: demoting accounts or removing permissions on
     * rollback could lock people out, so the upgrade is not undone.
     */
    public function down(): void
    {
        //
    }
};
