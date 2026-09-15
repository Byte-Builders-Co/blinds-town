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
            $table->boolean('is_active')->default(true)->after('is_default');
            $table->foreignId('requires_option_value_id')->nullable()->after('is_active')
                ->constrained('product_option_values')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_option_values', function (Blueprint $table) {
            $table->dropConstrainedForeignId('requires_option_value_id');
            $table->dropColumn('is_active');
        });
    }
};
