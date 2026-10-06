<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('guest_email')->nullable()->after('user_id');
        });

        Schema::table('coupon_usages', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('guest_email')->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupon_usages', function (Blueprint $table) {
            $table->dropColumn('guest_email');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('guest_email');
        });
    }
};
