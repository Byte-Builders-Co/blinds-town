<?php

namespace App\Services\Stripe;

interface PaymentGateway
{
    /**
     * @param  array<string, string>  $metadata
     * @return array{id: string, client_secret: string, status: string}
     */
    public function createPaymentIntent(
        int $amount,
        string $currency,
        string $customerEmail,
        array $metadata = [],
    ): array;

    /**
     * @return array{id: string, client_secret: ?string, status: string}
     */
    public function retrievePaymentIntent(string $paymentIntentId): array;

    /**
     * @return array{id: string, status: string}
     */
    public function refund(string $paymentIntentId, float $amount): array;
}
