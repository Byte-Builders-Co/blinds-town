<?php

use App\Models\Order;
use App\Models\Payment;
use App\Notifications\PaymentFailedNotification;
use App\Services\PaymentService;
use App\Services\Stripe\PaymentGateway;
use Illuminate\Support\Facades\Notification;

test('a failed payment records an admin alert and notifies the customer', function () {
    Notification::fake();
    app()->instance(PaymentGateway::class, new class implements PaymentGateway
    {
        public function createPaymentIntent(int $amount, string $currency, string $customerEmail, array $metadata = []): array
        {
            return ['id' => 'pi_test', 'client_secret' => 'pi_test_secret', 'status' => 'requires_payment_method'];
        }

        public function retrievePaymentIntent(string $paymentIntentId): array
        {
            return ['id' => $paymentIntentId, 'client_secret' => 'pi_test_secret', 'status' => 'succeeded'];
        }

        public function refund(string $paymentIntentId, float $amount): array
        {
            return ['id' => 're_test', 'status' => 'succeeded'];
        }
    });

    $order = Order::factory()->create();
    $payment = Payment::factory()->for($order)->create();

    app(PaymentService::class)->markFailed($payment, 'Card declined.');

    expect($payment->fresh()->status->value)->toBe('failed');
    $this->assertDatabaseHas('admin_alerts', [
        'type' => 'payment_failed',
        'title' => "Payment failed — {$order->order_number}",
        'message' => 'Card declined.',
    ]);
    Notification::assertSentTo($order->user, PaymentFailedNotification::class);
});
