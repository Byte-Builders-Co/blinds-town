<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Notification Channels
    |--------------------------------------------------------------------------
    |
    | Toggle each channel independently. Email uses Laravel's existing mail
    | configuration and is safe to leave on. SMS and WhatsApp require a
    | provider to be configured (see services.sms / services.whatsapp) —
    | when disabled or unconfigured, sends are logged and skipped rather
    | than blocking the request.
    |
    */

    'channels' => [
        'email' => (bool) env('NOTIFICATIONS_EMAIL_ENABLED', true),
        'sms' => (bool) env('NOTIFICATIONS_SMS_ENABLED', false),
        'whatsapp' => (bool) env('NOTIFICATIONS_WHATSAPP_ENABLED', false),
    ],

];
