<?php

namespace App\Notifications\Channels;

use App\Notifications\Messages\SmsMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class SmsChannel
{
    public function send(mixed $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toSms')) {
            return;
        }

        /** @var SmsMessage $message */
        $message = $notification->toSms($notifiable);

        if (! $message->to) {
            Log::info('SMS notification skipped: no phone number on record.', [
                'notification' => $notification::class,
            ]);

            return;
        }

        $driver = config('services.sms.driver');

        if (! $driver) {
            Log::info('SMS notification skipped: no SMS provider configured.', [
                'notification' => $notification::class,
                'to' => $message->to,
            ]);

            return;
        }

        // No SMS provider SDK is installed. Log what would be sent so the
        // integration point is ready for a real driver (Twilio, MSG91, etc.)
        // to be plugged in without touching call sites.
        Log::info('SMS notification would be sent.', [
            'driver' => $driver,
            'notification' => $notification::class,
            'to' => $message->to,
            'content' => $message->content,
        ]);
    }
}
