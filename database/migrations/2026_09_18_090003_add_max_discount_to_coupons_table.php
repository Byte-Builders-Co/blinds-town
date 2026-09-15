<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Guarded with hasColumn because create_coupons_table already declares
     * max_discount for fresh installs — this only backfills databases where
     * that migration ran before max_discount was added to it.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('coupons', 'max_discount')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->decimal('max_discount', 10, 2)->nullable()->after('min_order_amount');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn('max_discount');
        });
    }
};
