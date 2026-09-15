<?php

use App\Enums\NotificationChannel;
use App\Models\Order;
use App\Notifications\Channels\SmsChannel;
use App\Notifications\Channels\WhatsAppChannel;
use App\Notifications\OrderConfirmationNotification;
use App\Services\Notifications\NotificationService;

test('only email channel is used when sms and whatsapp are disabled', function () {
    config(['notifications.channels' => ['email' => true, 'sms' => false, 'whatsapp' => false]]);

    $channels = app(NotificationService::class)->channels();

    expect($channels)->toBe(['mail']);
});

test('sms and whatsapp channels are included once enabled', function () {
    config(['notifications.channels' => ['email' => true, 'sms' => true, 'whatsapp' => true]]);

    $channels = app(NotificationService::class)->channels();

    expect($channels)->toBe(['mail', SmsChannel::class, WhatsAppChannel::class]);
});

test('isEnabled reflects individual channel config', function () {
    config(['notifications.channels' => ['email' => true, 'sms' => false, 'whatsapp' => false]]);
    $service = app(NotificationService::class);

    expect($service->isEnabled(NotificationChannel::Email))->toBeTrue();
    expect($service->isEnabled(NotificationChannel::Sms))->toBeFalse();
});

test('sms channel does not throw and skips sending when no provider is configured', function () {
    config(['services.sms.driver' => null]);
    $order = Order::factory()->create();
    $notification = new OrderConfirmationNotification($order);

    (new SmsChannel)->send($order->user, $notification);
})->throwsNoExceptions();

test('whatsapp channel does not throw and skips sending when no provider is configured', function () {
    config(['services.whatsapp.driver' => null]);
    $order = Order::factory()->create();
    $notification = new OrderConfirmationNotification($order);

    (new WhatsAppChannel)->send($order->user, $notification);
})->throwsNoExceptions();
