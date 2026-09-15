<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const STATUS_MAP = [
        'pending_payment' => 'pending',
        'paid' => 'confirmed',
        'processing' => 'manufacturing',
        'shipped' => 'shipped',
        'completed' => 'delivered',
        'cancelled' => 'cancelled',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (DB::table('orders')->get() as $order) {
            $paymentStatus = in_array($order->status, ['paid', 'processing', 'shipped', 'completed'], true)
                ? 'paid'
                : 'pending';

            DB::table('payments')->insert([
                'order_id' => $order->id,
                'method' => 'online',
                'gateway' => $order->stripe_checkout_session_id ? 'stripe' : null,
                'amount' => $order->total,
                'currency' => $order->currency,
                'status' => $paymentStatus,
                'gateway_session_id' => $order->stripe_checkout_session_id,
                'gateway_transaction_id' => $order->stripe_payment_intent_id,
                'paid_at' => $paymentStatus === 'paid' ? $order->updated_at : null,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ]);

            DB::table('orders')->where('id', $order->id)->update([
                'status' => self::STATUS_MAP[$order->status] ?? 'pending',
            ]);
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['stripe_checkout_session_id', 'stripe_payment_intent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('stripe_checkout_session_id')->nullable();
            $table->string('stripe_payment_intent_id')->nullable();
        });

        foreach (DB::table('payments')->get() as $payment) {
            DB::table('orders')->where('id', $payment->order_id)->update([
                'stripe_checkout_session_id' => $payment->gateway_session_id,
                'stripe_payment_intent_id' => $payment->gateway_transaction_id,
            ]);
        }

        DB::table('payments')->delete();

        $reverseMap = array_flip(self::STATUS_MAP);

        foreach (DB::table('orders')->get() as $order) {
            DB::table('orders')->where('id', $order->id)->update([
                'status' => $reverseMap[$order->status] ?? 'pending_payment',
            ]);
        }
    }
};
