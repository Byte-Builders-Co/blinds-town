<?php

namespace App\Notifications\Channels;

use App\Notifications\Messages\WhatsAppMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    public function send(mixed $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toWhatsApp')) {
            return;
        }

        /** @var WhatsAppMessage $message */
        $message = $notification->toWhatsApp($notifiable);

        if (! $message->to) {
            Log::info('WhatsApp notification skipped: no phone number on record.', [
                'notification' => $notification::class,
            ]);

            return;
        }

        $driver = config('services.whatsapp.driver');

        if (! $driver) {
            Log::info('WhatsApp notification skipped: no WhatsApp provider configured.', [
                'notification' => $notification::class,
                'to' => $message->to,
            ]);

            return;
        }

        // No WhatsApp provider SDK is installed. Log what would be sent so
        // the integration point is ready for a real driver (Meta Cloud API,
        // Twilio, etc.) to be plugged in without touching call sites.
        Log::info('WhatsApp notification would be sent.', [
            'driver' => $driver,
            'notification' => $notification::class,
            'to' => $message->to,
            'content' => $message->content,
        ]);
    }
}
