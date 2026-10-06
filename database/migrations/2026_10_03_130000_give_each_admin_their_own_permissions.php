<?php

use App\Support\Rbac\RbacBootstrap;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * A data upgrade, not a schema change. Admins used to receive all their
     * permissions from the Admin role; they now hold them individually, like
     * Staff, so a Super Admin can choose what each Admin may do. Every existing
     * Admin is given exactly the permissions the Admin role had, so nobody gains
     * or loses access. Running it again changes nothing.
     */
    public function up(): void
    {
        RbacBootstrap::moveAdminPermissionsToUsers();
    }

    /**
     * Reverse the migrations.
     *
     * Intentionally empty: putting the permissions back on the role would
     * silently widen access for any Admin whose permissions were since trimmed.
     */
    public function down(): void
    {
        //
    }
};
