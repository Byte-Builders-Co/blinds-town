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
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('adjustable_type');
            $table->unsignedBigInteger('adjustable_id');
            $table->string('type');
            $table->decimal('previous_quantity', 12, 2);
            $table->decimal('adjustment', 12, 2);
            $table->decimal('new_quantity', 12, 2);
            $table->string('reason');
            $table->foreignId('adjusted_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['adjustable_type', 'adjustable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustments');
    }
};
