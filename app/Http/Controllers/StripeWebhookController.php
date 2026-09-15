<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Stripe\Event;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
    ) {}

    public function handle(Request $request): Response
    {
        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature', ''),
                (string) config('services.stripe.webhook_secret'),
            );
        } catch (SignatureVerificationException|\UnexpectedValueException $exception) {
            Log::warning('Stripe webhook signature verification failed.', ['error' => $exception->getMessage()]);

            return response('Invalid signature', 400);
        }

        match ($event->type) {
            Event::PAYMENT_INTENT_SUCCEEDED => $this->handlePaymentIntentSucceeded($event),
            Event::PAYMENT_INTENT_PAYMENT_FAILED => $this->handlePaymentIntentFailed($event),
            default => null,
        };

        return response('OK', 200);
    }

    private function handlePaymentIntentSucceeded(Event $event): void
    {
        $intent = $event->data->object;

        $payment = Payment::query()->where('gateway_transaction_id', $intent->id)->first();

        if (! $payment) {
            Log::warning('Stripe webhook: no payment found for succeeded PaymentIntent.', ['payment_intent' => $intent->id]);

            return;
        }

        // confirmSucceeded() only acts while the payment is still Pending, which
        // makes this handler idempotent against Stripe's at-least-once delivery
        // and safe to run alongside the checkout success page's own verification.
        $this->payments->confirmSucceeded($payment, $intent->id);
    }

    private function handlePaymentIntentFailed(Event $event): void
    {
        $intent = $event->data->object;

        $payment = Payment::query()->where('gateway_transaction_id', $intent->id)->first();

        if (! $payment || $payment->status !== PaymentStatus::Pending) {
            return;
        }

        $reason = $intent->last_payment_error->message ?? 'Payment failed.';

        $this->payments->markFailed($payment, $reason);
    }
}
