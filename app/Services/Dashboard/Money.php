<?php

namespace App\Services\Dashboard;

use Illuminate\Support\Number;

/**
 * Formats amounts for the sentences the dashboard generates server-side
 * (insights, activity descriptions). The charts and tables format on the
 * client with the same currency and locale.
 */
final class Money
{
    public static function format(float $amount, string $currency): string
    {
        $currency = strtoupper($currency);

        if (! extension_loaded('intl')) {
            return $currency.' '.number_format($amount, 2);
        }

        return Number::currency($amount, $currency, $currency === 'INR' ? 'en_IN' : 'en_US');
    }
}
