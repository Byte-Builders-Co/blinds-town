<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use App\Services\Stripe\PaymentGateway;

function fakePaymentGateway(string $retrieveStatus = 'requires_payment_method'): PaymentGateway
{
    $fake = new class($retrieveStatus) implements PaymentGateway
    {
        public function __construct(private readonly string $retrieveStatus) {}

        public function createPaymentIntent(int $amount, string $currency, string $customerEmail, array $metadata = []): array
        {
            return [
                'id' => 'pi_test_123',
                'client_secret' => 'pi_test_123_secret_abc',
                'status' => 'requires_payment_method',
            ];
        }

        public function retrievePaymentIntent(string $paymentIntentId): array
        {
            return [
                'id' => $paymentIntentId,
                'client_secret' => $paymentIntentId.'_secret_abc',
                'status' => $this->retrieveStatus,
            ];
        }

        public function refund(string $paymentIntentId, float $amount): array
        {
            return ['id' => 're_test_123', 'status' => 'succeeded'];
        }
    };

    app()->instance(PaymentGateway::class, $fake);

    return $fake;
}

function addProductToCart($actor, Product $product): void
{
    $actor->post('/cart', [
        'product_id' => $product->id,
        'width' => $product->min_width_cm,
        'height' => $product->min_height_cm,
        'unit' => 'cm',
        'quantity' => 1,
    ]);
}

function shippingDetails(array $overrides = []): array
{
    return array_merge([
        'shipping_name' => 'Jane Doe',
        'shipping_line1' => '123 Main St',
        'shipping_city' => 'Springfield',
        'shipping_postal_code' => '12345',
        'shipping_country' => 'US',
        'shipping_phone' => '555-0100',
    ], $overrides);
}

test('guests can open the checkout page when their cart has items', function () {
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this, $product);

    $this->get('/checkout')->assertOk();
});

test('a guest can place an order and pay without logging in', function () {
    fakePaymentGateway();

    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this, $product);

    $response = $this->post('/checkout', shippingDetails(['email' => 'guest@example.com']));

    $order = Order::query()->firstOrFail();

    expect($order->user_id)->toBeNull();
    expect($order->guest_email)->toBe('guest@example.com');
    expect((float) $order->total)->toBe(20.0);

    $response->assertRedirect(route('checkout.pay', $order));

    $this->get(route('checkout.pay', $order))->assertOk();
});

test('guest checkout requires a valid email address', function () {
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this, $product);

    $this->post('/checkout', shippingDetails())->assertSessionHasErrors('email');
    $this->post('/checkout', shippingDetails(['email' => 'nope']))->assertSessionHasErrors('email');

    expect(Order::query()->count())->toBe(0);
});

test('a guest cannot open another browsers guest order', function () {
    fakePaymentGateway();

    $order = Order::factory()->create(['user_id' => null, 'guest_email' => 'someone@example.com']);

    $this->get(route('checkout.pay', $order))->assertForbidden();
    $this->get(route('checkout.success', $order))->assertForbidden();
});

test('a guest cannot open an order that belongs to an account', function () {
    $order = Order::factory()->create();

    $this->get(route('checkout.success', $order))->assertForbidden();
});

test('guests can view their order through the signed tracking link only', function () {
    $order = Order::factory()->create(['user_id' => null, 'guest_email' => 'someone@example.com']);

    $this->get(route('orders.track', $order))->assertForbidden();

    $this->get($order->viewUrl())->assertOk();
});

test('admin and staff accounts cannot check out', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/checkout')->assertForbidden();
});

test('placing an order records a new-order admin alert', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this->actingAs($user), $product);
    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    $this->assertDatabaseHas('admin_alerts', [
        'type' => 'new_order',
        'title' => "New order — {$order->order_number}",
    ]);
});

test('checkout creates a pending order and payment, then redirects to the payment page', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this->actingAs($user), $product);

    $response = $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    expect($order->status)->toBe(OrderStatus::Pending);
    expect((float) $order->total)->toBe(20.0);
    expect($order->items)->toHaveCount(1);
    expect($order->payment->method)->toBe(PaymentMethod::Online);
    expect($order->payment->status)->toBe(PaymentStatus::Pending);
    expect($order->payment->gateway_transaction_id)->toBeNull();

    $response->assertRedirect(route('checkout.pay', $order));
});

test('the payment page creates a PaymentIntent for the order total and never trusts a client-supplied amount', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this->actingAs($user), $product);
    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    $response = $this->actingAs($user)->get(route('checkout.pay', $order));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/checkout-pay')
        ->where('clientSecret', 'pi_test_123_secret_abc')
    );
    expect($order->payment->fresh()->gateway_transaction_id)->toBe('pi_test_123');
    expect($order->payment->fresh()->status)->toBe(PaymentStatus::Pending);
});

test('checkout success verifies the PaymentIntent with Stripe before marking the payment paid', function () {
    fakePaymentGateway('succeeded');

    $user = User::factory()->create();
    $product = Product::factory()->create();

    addProductToCart($this->actingAs($user), $product);

    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    // The Payment Element page must have run at least once to create the
    // PaymentIntent, the same way the browser would before Stripe redirects
    // the customer back to the success page.
    $this->actingAs($user)->get(route('checkout.pay', $order));

    $response = $this->actingAs($user)->get(route('checkout.success', $order));

    $response->assertOk();
    expect($order->fresh()->status)->toBe(OrderStatus::Confirmed);
    expect($order->payment->fresh()->status)->toBe(PaymentStatus::Paid);
    expect($order->payment->fresh()->gateway_transaction_id)->toBe('pi_test_123');
    expect($order->fresh()->statusHistories()->pluck('status')->all())->toBe(['pending', 'confirmed']);
});

test('checkout success does not mark the order paid while Stripe reports the PaymentIntent as unpaid', function () {
    fakePaymentGateway('requires_payment_method');

    $user = User::factory()->create();
    $product = Product::factory()->create();

    addProductToCart($this->actingAs($user), $product);
    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    $this->actingAs($user)->get(route('checkout.pay', $order));
    $response = $this->actingAs($user)->get(route('checkout.success', $order));

    $response->assertOk();
    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
    expect($order->payment->fresh()->status)->toBe(PaymentStatus::Pending);
});

test('installation charge is added to the order total when requested', function () {
    fakePaymentGateway();
    Setting::set('shipping.installation_charge', 30);

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this->actingAs($user), $product);

    $this->actingAs($user)->post('/checkout', shippingDetails(['installation_requested' => true]));

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    expect($order->installation_requested)->toBeTrue();
    expect((float) $order->installation_charge)->toBe(30.0);
    expect((float) $order->total)->toBe(50.0);
});

test('the configured default shipping charge is applied', function () {
    fakePaymentGateway();
    Setting::set('shipping.default_shipping_charge', 15);

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this->actingAs($user), $product);
    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    expect((float) $order->shipping_charge)->toBe(15.0);
    expect((float) $order->total)->toBe(35.0);
});

test('disabling shipping removes the shipping charge', function () {
    fakePaymentGateway();
    Setting::set('shipping.default_shipping_charge', 15);
    Setting::set('shipping.shipping_enabled', false);

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this->actingAs($user), $product);
    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    expect((float) $order->shipping_charge)->toBe(0.0);
});

test('orders at or above the free shipping threshold waive the shipping charge', function () {
    fakePaymentGateway();
    Setting::set('shipping.default_shipping_charge', 15);
    Setting::set('shipping.free_shipping_threshold', 20);

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this->actingAs($user), $product);
    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    expect((float) $order->shipping_charge)->toBe(0.0);
});

test('a valid coupon discounts the order total and records usage', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 100, 'price_per_sqm' => 0]);
    $coupon = Coupon::factory()->create(['code' => 'SAVE10', 'value' => 10]);

    addProductToCart($this->actingAs($user), $product);

    $this->actingAs($user)->post('/checkout', shippingDetails(['coupon_code' => 'SAVE10']));

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    expect((float) $order->discount_amount)->toBe(10.0);
    expect((float) $order->total)->toBe(90.0);
    expect($order->coupon_code)->toBe('SAVE10');
    $this->assertDatabaseHas('coupon_usages', ['coupon_id' => $coupon->id, 'user_id' => $user->id, 'order_id' => $order->id]);
});

test('an invalid coupon code is rejected', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create();

    addProductToCart($this->actingAs($user), $product);

    $response = $this->actingAs($user)->post('/checkout', shippingDetails(['coupon_code' => 'NOPE']));

    $response->assertSessionHasErrors(['coupon_code']);
    $this->assertDatabaseMissing('orders', ['user_id' => $user->id]);
});

test('a coupon restricted to another category does not apply to the cart', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 100, 'price_per_sqm' => 0]);
    $otherCategory = Category::factory()->create();
    $coupon = Coupon::factory()->create(['code' => 'CATONLY', 'value' => 10]);
    $coupon->categories()->attach($otherCategory);

    addProductToCart($this->actingAs($user), $product);

    $response = $this->actingAs($user)->post('/checkout', shippingDetails(['coupon_code' => 'CATONLY']));

    $response->assertSessionHasErrors(['coupon_code']);
    $this->assertDatabaseMissing('orders', ['user_id' => $user->id]);
});

test('a coupon restricted to the cart product applies normally', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 100, 'price_per_sqm' => 0]);
    $coupon = Coupon::factory()->create(['code' => 'THISONE', 'value' => 10]);
    $coupon->products()->attach($product);

    addProductToCart($this->actingAs($user), $product);

    $this->actingAs($user)->post('/checkout', shippingDetails(['coupon_code' => 'THISONE']));

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    expect((float) $order->discount_amount)->toBe(10.0);
});

test('max_discount caps a percentage coupon', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 200, 'price_per_sqm' => 0]);
    Coupon::factory()->create(['code' => 'CAPPED', 'value' => 50, 'max_discount' => 30]);

    addProductToCart($this->actingAs($user), $product);

    $this->actingAs($user)->post('/checkout', shippingDetails(['coupon_code' => 'CAPPED']));

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    expect((float) $order->discount_amount)->toBe(30.0);
});

test('retrying payment for a pending order reuses the existing PaymentIntent without duplicating the order', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create();

    addProductToCart($this->actingAs($user), $product);
    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();

    // First load creates the PaymentIntent.
    $this->actingAs($user)->get(route('checkout.pay', $order));
    expect($order->payment->fresh()->gateway_transaction_id)->toBe('pi_test_123');

    $response = $this->actingAs($user)->post("/checkout/{$order->id}/retry");
    $response->assertRedirect(route('checkout.pay', $order));

    // The retry still points at the same still-payable PaymentIntent — no new
    // one is created — and no second order was created.
    $this->actingAs($user)->get(route('checkout.pay', $order));
    expect($order->payment->fresh()->gateway_transaction_id)->toBe('pi_test_123');
    expect(Order::query()->where('user_id', $user->id)->count())->toBe(1);
});

test('changing a product price after an order exists does not change the existing order', function () {
    fakePaymentGateway();

    $user = User::factory()->create();
    $product = Product::factory()->create(['base_price' => 20, 'price_per_sqm' => 0]);

    addProductToCart($this->actingAs($user), $product);

    $this->actingAs($user)->post('/checkout', shippingDetails());

    $order = Order::query()->where('user_id', $user->id)->firstOrFail();
    $originalTotal = (float) $order->total;
    $originalItemBreakdown = $order->items->first()->price_breakdown;

    $product->update(['base_price' => 999]);

    expect((float) $order->fresh()->total)->toBe($originalTotal);
    expect($order->fresh()->items->first()->price_breakdown)->toBe($originalItemBreakdown);
});

test('a customer cannot view another customers checkout success page', function () {
    fakePaymentGateway();

    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $order = Order::factory()->for($owner)->create();

    $response = $this->actingAs($intruder)->get(route('checkout.success', $order));

    $response->assertForbidden();
});
