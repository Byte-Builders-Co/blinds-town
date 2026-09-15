<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\OrderStatusUpdatedNotification;
use App\Notifications\RefundCompletedNotification;
use App\Services\Stripe\PaymentGateway;
use Illuminate\Support\Facades\Notification;

function fakeAdminCheckoutGateway(): void
{
    $fake = new class implements PaymentGateway
    {
        public function createPaymentIntent(int $amount, string $currency, string $customerEmail, array $metadata = []): array
        {
            return ['id' => 'pi_test_123', 'client_secret' => 'pi_test_123_secret_abc', 'status' => 'requires_payment_method'];
        }

        public function retrievePaymentIntent(string $paymentIntentId): array
        {
            return ['id' => $paymentIntentId, 'client_secret' => 'pi_test_123_secret_abc', 'status' => 'succeeded'];
        }

        public function refund(string $paymentIntentId, float $amount): array
        {
            return ['id' => 're_test_123', 'status' => 'succeeded'];
        }
    };

    app()->instance(PaymentGateway::class, $fake);
}

test('customers cannot access admin order management', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/orders');

    $response->assertForbidden();
});

test('admins can view the order list', function () {
    $admin = User::factory()->admin()->create();
    Order::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/admin/orders');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('admin/orders/index')->has('orders.data', 3));
});

test('admins can update an order status and the customer is notified', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create(['status' => OrderStatus::Confirmed]);

    $response = $this->actingAs($admin)->patch("/admin/orders/{$order->id}/status", [
        'status' => 'shipped',
    ]);

    $response->assertRedirect(route('admin.orders.show', $order));
    expect($order->fresh()->status)->toBe(OrderStatus::Shipped);

    Notification::assertSentTo($order->user, OrderStatusUpdatedNotification::class);
});

test('disabling the shipped notification event suppresses it but other transitions still notify', function () {
    Notification::fake();
    Setting::set('notifications.event_order_shipped', false);

    $admin = User::factory()->admin()->create();
    $shippedOrder = Order::factory()->create(['status' => OrderStatus::Confirmed]);
    $manufacturingOrder = Order::factory()->create(['status' => OrderStatus::Confirmed]);

    $this->actingAs($admin)->patch("/admin/orders/{$shippedOrder->id}/status", ['status' => 'shipped']);
    $this->actingAs($admin)->patch("/admin/orders/{$manufacturingOrder->id}/status", ['status' => 'manufacturing']);

    Notification::assertNotSentTo($shippedOrder->user, OrderStatusUpdatedNotification::class);
    Notification::assertSentTo($manufacturingOrder->user, OrderStatusUpdatedNotification::class);
});

test('admins can filter orders by payment status', function () {
    $admin = User::factory()->admin()->create();
    $paidOrder = Order::factory()->create();
    Payment::factory()->for($paidOrder)->paid()->create();
    $pendingOrder = Order::factory()->create();
    Payment::factory()->for($pendingOrder)->create();

    $response = $this->actingAs($admin)->get('/admin/orders?payment_status=paid');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/orders/index')
        ->has('orders.data', 1)
        ->where('orders.data.0.id', $paidOrder->id)
    );
});

test('admins can add tracking information to an order', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->confirmed()->create();

    $response = $this->actingAs($admin)->patch("/admin/orders/{$order->id}/tracking", [
        'carrier' => 'UPS',
        'tracking_number' => '1Z999AA10123456784',
    ]);

    $response->assertRedirect(route('admin.orders.show', $order));
    $order->refresh();
    expect($order->carrier)->toBe('UPS');
    expect($order->tracking_number)->toBe('1Z999AA10123456784');
    expect($order->shipped_at)->not->toBeNull();
});

test('admins can refund a paid order and the customer is notified', function () {
    Notification::fake();
    fakeAdminCheckoutGateway();

    $admin = User::factory()->admin()->create();
    $order = Order::factory()->confirmed()->create(['total' => 100]);
    $payment = Payment::factory()->for($order)->paid()->create(['amount' => 100, 'gateway_transaction_id' => 'pi_test_123']);

    $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/refund", [
        'amount' => 100,
        'reason' => 'Customer requested cancellation',
    ]);

    $response->assertRedirect(route('admin.orders.show', $order));
    expect($payment->fresh()->status)->toBe(PaymentStatus::Refunded);
    $this->assertDatabaseHas('refunds', ['payment_id' => $payment->id, 'amount' => 100]);
    Notification::assertSentTo($order->user, RefundCompletedNotification::class);
});

test('a refund cannot exceed the paid amount', function () {
    fakeAdminCheckoutGateway();

    $admin = User::factory()->admin()->create();
    $order = Order::factory()->confirmed()->create(['total' => 100]);
    Payment::factory()->for($order)->paid()->create(['amount' => 100]);

    $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/refund", [
        'amount' => 150,
    ]);

    $response->assertSessionHasErrors(['amount']);
});
