<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Models\Setting;
use App\Notifications\Channels\SmsChannel;
use App\Notifications\Channels\WhatsAppChannel;

class NotificationService
{
    public function isEnabled(NotificationChannel $channel): bool
    {
        return (bool) Setting::get(
            "notifications.channel_{$channel->value}",
            config("notifications.channels.{$channel->value}", false),
        );
    }

    /**
     * Whether a given notification event (e.g. "order_created", "low_stock")
     * should currently notify. Defaults to enabled for events with no
     * configured toggle.
     */
    public function isEventEnabled(string $event): bool
    {
        return (bool) Setting::get("notifications.event_{$event}", true);
    }

    /**
     * The Laravel notification channels to dispatch through, based on what's
     * enabled. "mail" is Laravel's built-in channel; SMS/WhatsApp are our
     * own channel classes that no-op (and log) when unconfigured.
     *
     * @return array<int, string>
     */
    public function channels(): array
    {
        $channels = [];

        if ($this->isEnabled(NotificationChannel::Email)) {
            $channels[] = 'mail';
        }

        if ($this->isEnabled(NotificationChannel::Sms)) {
            $channels[] = SmsChannel::class;
        }

        if ($this->isEnabled(NotificationChannel::WhatsApp)) {
            $channels[] = WhatsAppChannel::class;
        }

        return $channels;
    }
}
