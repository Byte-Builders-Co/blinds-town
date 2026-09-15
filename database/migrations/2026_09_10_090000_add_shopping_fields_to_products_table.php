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
            $table->string('sku')->nullable()->unique()->after('id');
            $table->boolean('is_featured')->default(false)->after('is_active');
            $table->string('stock_status')->default('in_stock')->after('is_featured');
            $table->decimal('discount_percent', 5, 2)->nullable()->after('tax_rate_percent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['sku', 'is_featured', 'stock_status', 'discount_percent']);
        });
    }
};
