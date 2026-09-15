<?php

namespace App\Services\Stripe;

use Stripe\StripeClient;

class StripePaymentGateway implements PaymentGateway
{
    public function __construct(
        private readonly StripeClient $stripe,
    ) {}

    public function createPaymentIntent(
        int $amount,
        string $currency,
        string $customerEmail,
        array $metadata = [],
    ): array {
        $intent = $this->stripe->paymentIntents->create([
            'amount' => $amount,
            'currency' => $currency,
            'receipt_email' => $customerEmail,
            'automatic_payment_methods' => ['enabled' => true],
            'metadata' => $metadata,
            // Force 3D Secure authentication on every card payment, rather
            // than only when the card issuer's own risk rules require it.
            'payment_method_options' => [
                'card' => ['request_three_d_secure' => 'any'],
            ],
        ]);

        return [
            'id' => $intent->id,
            'client_secret' => $intent->client_secret,
            'status' => $intent->status,
        ];
    }

    public function retrievePaymentIntent(string $paymentIntentId): array
    {
        $intent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

        return [
            'id' => $intent->id,
            'client_secret' => $intent->client_secret,
            'status' => $intent->status,
        ];
    }

    public function refund(string $paymentIntentId, float $amount): array
    {
        $refund = $this->stripe->refunds->create([
            'payment_intent' => $paymentIntentId,
            'amount' => (int) round($amount * 100),
        ]);

        return ['id' => $refund->id, 'status' => $refund->status];
    }
}
