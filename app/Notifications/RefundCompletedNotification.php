<?php

namespace App\Notifications;

use App\Models\Refund;
use App\Notifications\Messages\SmsMessage;
use App\Notifications\Messages\WhatsAppMessage;
use App\Services\Notifications\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RefundCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Refund $refund,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return app(NotificationService::class)->channels();
    }

    public function toMail(object $notifiable): MailMessage
    {
        $order = $this->refund->payment->order;

        return (new MailMessage)
            ->subject("Refund Completed — {$order->order_number}")
            ->greeting("Hi {$order->shipping_name},")
            ->line('Your refund of '.strtoupper($order->currency).' '.number_format((float) $this->refund->amount, 2)." for order {$order->order_number} has been completed.")
            ->action('View your order', $order->viewUrl());
    }

    public function toSms(object $notifiable): SmsMessage
    {
        $order = $this->refund->payment->order;

        return new SmsMessage(
            to: $order->shipping_phone,
            content: 'Refund of '.strtoupper($order->currency).' '.number_format((float) $this->refund->amount, 2)." for order {$order->order_number} completed.",
        );
    }

    public function toWhatsApp(object $notifiable): WhatsAppMessage
    {
        $order = $this->refund->payment->order;

        return new WhatsAppMessage(
            to: $order->shipping_phone,
            content: 'Refund of '.strtoupper($order->currency).' '.number_format((float) $this->refund->amount, 2)." for order {$order->order_number} completed.",
        );
    }
}
