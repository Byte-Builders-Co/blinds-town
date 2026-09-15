<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Stripe\PaymentGateway;
use Stripe\WebhookSignature;

function fakeOrderHistoryPaymentGateway(): void
{
    $fake = new class implements PaymentGateway
    {
        public function createPaymentIntent(int $amount, string $currency, string $customerEmail, array $metadata = []): array
        {
            return [
                'id' => 'pi_history_test',
                'client_secret' => 'pi_history_test_secret_abc',
                'status' => 'requires_payment_method',
            ];
        }

        public function retrievePaymentIntent(string $paymentIntentId): array
        {
            return ['id' => $paymentIntentId, 'client_secret' => 'pi_history_test_secret_abc', 'status' => 'requires_payment_method'];
        }

        public function refund(string $paymentIntentId, float $amount): array
        {
            return ['id' => 're_test', 'status' => 'succeeded'];
        }
    };

    app()->instance(PaymentGateway::class, $fake);
}

test('an order paid through the Stripe PaymentIntent flow shows as paid in My Orders', function () {
    fakeOrderHistoryPaymentGateway();

    $customer = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 45, 'price_per_sqm' => 0]);

    $this->actingAs($customer)->post('/cart', [
        'product_id' => $product->id,
        'width' => $product->min_width_cm,
        'height' => $product->min_height_cm,
        'unit' => 'cm',
        'quantity' => 1,
    ]);

    $this->actingAs($customer)->post('/checkout', [
        'shipping_name' => 'Jane Doe',
        'shipping_line1' => '123 Main St',
        'shipping_city' => 'Springfield',
        'shipping_postal_code' => '12345',
        'shipping_country' => 'US',
        'shipping_phone' => '555-0100',
    ]);

    $order = Order::query()->where('user_id', $customer->id)->firstOrFail();

    // The customer opens the Payment Element page, which creates the PaymentIntent.
    $this->actingAs($customer)->get(route('checkout.pay', $order));

    // Not paid yet — the order should not show as confirmed in the customer's history.
    $indexBeforePayment = $this->actingAs($customer)->get('/orders');
    $indexBeforePayment->assertInertia(fn ($page) => $page
        ->component('orders/index')
        ->where('orders.data.0.status', 'pending')
    );

    // Stripe confirms the payment out-of-band and calls the webhook.
    $body = json_encode([
        'id' => 'evt_history_test',
        'type' => 'payment_intent.succeeded',
        'data' => ['object' => ['id' => 'pi_history_test', 'object' => 'payment_intent', 'status' => 'succeeded']],
    ]);
    $secret = 'whsec_history_test';
    config(['services.stripe.webhook_secret' => $secret]);

    $this->call('POST', route('stripe.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_STRIPE_SIGNATURE' => WebhookSignature::generateSignatureHeader($body, $secret),
    ], $body)->assertOk();

    expect($order->fresh()->status)->toBe(OrderStatus::Confirmed);
    expect($order->payment->fresh()->status)->toBe(PaymentStatus::Paid);

    $index = $this->actingAs($customer)->get('/orders');
    $index->assertOk();
    $index->assertInertia(fn ($page) => $page
        ->component('orders/index')
        ->where('orders.data.0.order_number', $order->order_number)
        ->where('orders.data.0.status', 'confirmed')
    );

    $show = $this->actingAs($customer)->get("/orders/{$order->order_number}");
    $show->assertOk();
    $show->assertInertia(fn ($page) => $page
        ->component('orders/show')
        ->where('order.status', 'confirmed')
        ->where('order.payment.status', 'paid')
        ->where('order.payment.gateway_transaction_id', 'pi_history_test')
    );

    $invoice = $this->actingAs($customer)->get("/orders/{$order->order_number}/invoice");
    $invoice->assertOk();
    $invoice->assertInertia(fn ($page) => $page
        ->component('orders/invoice')
        ->where('order.payment.status', 'paid')
    );
});
