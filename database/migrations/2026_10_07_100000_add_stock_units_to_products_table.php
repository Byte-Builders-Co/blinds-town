<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('stock_units')->default(0)->after('stock_status');
        });

        // "Available for Customization" no longer exists; those products are simply in stock.
        DB::table('products')->where('stock_status', 'made_to_order')->update(['stock_status' => 'in_stock']);
        DB::table('products')->where('stock_status', 'in_stock')->update(['stock_units' => 100]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('stock_units');
        });
    }
};
