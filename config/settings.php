<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Settings Defaults
    |--------------------------------------------------------------------------
    |
    | The canonical list of admin-editable store settings, grouped and keyed
    | as "group.key". These defaults are used whenever no row exists yet in
    | the `settings` table, and also whitelist which keys the admin settings
    | screens are allowed to write.
    |
    */

    'defaults' => [
        'store' => [
            'store_name' => env('APP_NAME', 'Blinds Town'),
            'store_email' => null,
            'store_phone' => null,
            'store_address' => null,
            'currency' => 'usd',
            'timezone' => 'UTC',
            'logo_path' => null,
            'favicon_path' => null,
        ],
        'business' => [
            'legal_business_name' => null,
            'business_address' => null,
            'business_phone' => null,
            'business_email' => null,
            'gstin' => null,
            'registration_details' => null,
        ],
        'tax' => [
            'gst_enabled' => true,
            'gst_rate' => (float) env('SHOP_DEFAULT_TAX_RATE', 0),
            'tax_inclusive' => false,
        ],
        'shipping' => [
            'shipping_enabled' => true,
            'free_shipping_threshold' => null,
            'default_shipping_charge' => (float) env('SHOP_SHIPPING_CHARGE', 0),
            'installation_charge' => (float) env('SHOP_INSTALLATION_CHARGE', 25),
        ],
        'payment' => [
            'payment_gateway' => 'stripe',
            'test_mode' => true,
        ],
        'notifications' => [
            'channel_email' => (bool) env('NOTIFICATIONS_EMAIL_ENABLED', true),
            'channel_sms' => (bool) env('NOTIFICATIONS_SMS_ENABLED', false),
            'channel_whatsapp' => (bool) env('NOTIFICATIONS_WHATSAPP_ENABLED', false),
            'event_order_created' => true,
            'event_payment_success' => true,
            'event_payment_failed' => true,
            'event_order_shipped' => true,
            'event_order_delivered' => true,
            'event_low_stock' => true,
        ],
    ],

];
