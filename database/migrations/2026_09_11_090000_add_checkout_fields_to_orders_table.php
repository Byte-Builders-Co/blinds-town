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
            $table->decimal('discount_amount', 10, 2)->default(0)->after('subtotal');
            $table->string('coupon_code')->nullable()->after('discount_amount');
            $table->decimal('shipping_charge', 10, 2)->default(0)->after('tax_amount');
            $table->boolean('installation_requested')->default(false)->after('shipping_charge');
            $table->decimal('installation_charge', 10, 2)->default(0)->after('installation_requested');
            $table->string('carrier')->nullable()->after('shipping_phone');
            $table->string('tracking_number')->nullable()->after('carrier');
            $table->timestamp('shipped_at')->nullable()->after('tracking_number');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'discount_amount',
                'coupon_code',
                'shipping_charge',
                'installation_requested',
                'installation_charge',
                'carrier',
                'tracking_number',
                'shipped_at',
                'delivered_at',
            ]);
        });
    }
};
