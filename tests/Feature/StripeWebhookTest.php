<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Notifications\OrderConfirmationNotification;
use App\Notifications\PaymentFailedNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Testing\TestResponse;
use Stripe\WebhookSignature;

function stripeWebhookRequest(array $payload): TestResponse
{
    $body = json_encode($payload);
    $secret = 'whsec_test_secret';

    config(['services.stripe.webhook_secret' => $secret]);

    $signature = WebhookSignature::generateSignatureHeader($body, $secret);

    return test()->call('POST', route('stripe.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_STRIPE_SIGNATURE' => $signature,
    ], $body);
}

function paymentIntentEventPayload(string $type, string $paymentIntentId, array $objectOverrides = []): array
{
    return [
        'id' => 'evt_'.str()->random(16),
        'type' => $type,
        'data' => [
            'object' => array_merge([
                'id' => $paymentIntentId,
                'object' => 'payment_intent',
                'status' => $type === 'payment_intent.succeeded' ? 'succeeded' : 'requires_payment_method',
            ], $objectOverrides),
        ],
    ];
}

test('a request with an invalid signature is rejected', function () {
    config(['services.stripe.webhook_secret' => 'whsec_test_secret']);

    $response = test()->call('POST', route('stripe.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_STRIPE_SIGNATURE' => 't=1,v1=invalid',
    ], json_encode(['type' => 'payment_intent.succeeded']));

    $response->assertStatus(400);
});

test('payment_intent.succeeded marks the payment paid and confirms the order', function () {
    Notification::fake();

    $order = Order::factory()->create();
    $payment = Payment::factory()->for($order)->create([
        'gateway_transaction_id' => 'pi_test_123',
        'status' => PaymentStatus::Pending,
    ]);

    $response = stripeWebhookRequest(paymentIntentEventPayload('payment_intent.succeeded', 'pi_test_123'));

    $response->assertOk();
    expect($payment->fresh()->status)->toBe(PaymentStatus::Paid);
    expect($payment->fresh()->gateway_transaction_id)->toBe('pi_test_123');
    expect($order->fresh()->status)->toBe(OrderStatus::Confirmed);
    Notification::assertSentTo($order->user, OrderConfirmationNotification::class);
});

test('a duplicate payment_intent.succeeded event does not reprocess an already-paid payment', function () {
    Notification::fake();

    $order = Order::factory()->create();
    $payment = Payment::factory()->for($order)->create([
        'gateway_transaction_id' => 'pi_test_123',
        'status' => PaymentStatus::Pending,
    ]);

    $payload = paymentIntentEventPayload('payment_intent.succeeded', 'pi_test_123');

    stripeWebhookRequest($payload)->assertOk();
    stripeWebhookRequest($payload)->assertOk();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Paid);
    expect($order->fresh()->statusHistories()->where('status', 'confirmed')->count())->toBe(1);
    Notification::assertSentToTimes($order->user, OrderConfirmationNotification::class, 1);
});

test('payment_intent.payment_failed marks the payment failed and notifies the customer', function () {
    Notification::fake();

    $order = Order::factory()->create();
    $payment = Payment::factory()->for($order)->create([
        'gateway_transaction_id' => 'pi_test_456',
        'status' => PaymentStatus::Pending,
    ]);

    $response = stripeWebhookRequest(paymentIntentEventPayload('payment_intent.payment_failed', 'pi_test_456', [
        'last_payment_error' => ['message' => 'Your card was declined.'],
    ]));

    $response->assertOk();
    expect($payment->fresh()->status)->toBe(PaymentStatus::Failed);
    expect($payment->fresh()->failure_reason)->toBe('Your card was declined.');
    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
    Notification::assertSentTo($order->user, PaymentFailedNotification::class);
});

test('a duplicate payment_intent.payment_failed event does not reprocess an already-failed payment', function () {
    Notification::fake();

    $order = Order::factory()->create();
    Payment::factory()->for($order)->create([
        'gateway_transaction_id' => 'pi_test_456',
        'status' => PaymentStatus::Pending,
    ]);

    $payload = paymentIntentEventPayload('payment_intent.payment_failed', 'pi_test_456', [
        'last_payment_error' => ['message' => 'Your card was declined.'],
    ]);

    stripeWebhookRequest($payload)->assertOk();
    stripeWebhookRequest($payload)->assertOk();

    Notification::assertSentToTimes($order->user, PaymentFailedNotification::class, 1);
});

test('a webhook event for an unknown PaymentIntent is acknowledged without error', function () {
    $response = stripeWebhookRequest(paymentIntentEventPayload('payment_intent.succeeded', 'pi_does_not_exist'));

    $response->assertOk();
});
