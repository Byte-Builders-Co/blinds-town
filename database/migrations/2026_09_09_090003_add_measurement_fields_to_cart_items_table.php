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
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('measurement_unit')->default('cm')->after('height_cm');
            $table->string('measurement_photo_path')->nullable()->after('selected_options');
            $table->json('price_breakdown')->nullable()->after('measurement_photo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn(['measurement_unit', 'measurement_photo_path', 'price_breakdown']);
        });
    }
};
