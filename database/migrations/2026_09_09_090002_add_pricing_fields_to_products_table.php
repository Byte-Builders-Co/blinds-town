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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('min_area_sqm', 8, 2)->nullable()->after('price_per_sqm');
            $table->string('measurement_unit_default')->default('cm')->after('max_height_cm');
            $table->decimal('tax_rate_percent', 5, 2)->nullable()->after('base_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['min_area_sqm', 'measurement_unit_default', 'tax_rate_percent']);
        });
    }
};
