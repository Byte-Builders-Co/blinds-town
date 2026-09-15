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
        Schema::table('product_option_values', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('label');
            $table->string('hex_color', 7)->nullable()->after('image_path');
            $table->decimal('price_per_sqm', 10, 2)->nullable()->after('price_modifier');
            $table->text('instructions')->nullable()->after('price_per_sqm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_option_values', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'hex_color', 'price_per_sqm', 'instructions']);
        });
    }
};
