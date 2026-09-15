<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const ROLES = ['super-admin', 'admin', 'staff', 'customer'];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $roleIds = [];

        foreach (self::ROLES as $role) {
            $roleIds[$role] = DB::table('roles')->insertGetId([
                'name' => $role,
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        foreach (DB::table('users')->select('id', 'role')->get() as $user) {
            $roleName = $user->role === 'admin' ? 'admin' : 'customer';

            DB::table('model_has_roles')->insert([
                'role_id' => $roleIds[$roleName],
                'model_type' => User::class,
                'model_id' => $user->id,
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('customer');
        });

        DB::table('users')->whereIn('id', function ($query) {
            $query->select('model_id')
                ->from('model_has_roles')
                ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
                ->where('roles.name', 'admin');
        })->update(['role' => 'admin']);

        DB::table('model_has_roles')->whereIn('role_id', function ($query) {
            $query->select('id')->from('roles')->whereIn('name', self::ROLES);
        })->delete();

        DB::table('roles')->whereIn('name', self::ROLES)->delete();
    }
};
