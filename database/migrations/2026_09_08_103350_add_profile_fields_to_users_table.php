<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('mobile_number')->nullable()->after('email');
            $table->string('profile_image_path')->nullable()->after('mobile_number');
            $table->date('date_of_birth')->nullable()->after('profile_image_path');
            $table->string('status')->default('active')->after('date_of_birth');
        });

        foreach (DB::table('users')->select('id', 'name')->get() as $user) {
            [$firstName, $lastName] = array_pad(explode(' ', (string) $user->name, 2), 2, '');

            DB::table('users')->where('id', $user->id)->update([
                'first_name' => $firstName !== '' ? $firstName : 'User',
                'last_name' => $lastName,
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->nullable();
        });

        foreach (DB::table('users')->select('id', 'first_name', 'last_name')->get() as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'name' => trim("{$user->first_name} {$user->last_name}"),
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'mobile_number', 'profile_image_path', 'date_of_birth', 'status']);
        });
    }
};
