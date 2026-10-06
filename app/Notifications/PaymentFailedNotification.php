<?php

namespace App\Notifications;

use App\Models\Payment;
use App\Notifications\Messages\SmsMessage;
use App\Notifications\Messages\WhatsAppMessage;
use App\Services\Notifications\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Payment $payment,
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
        $order = $this->payment->order;

        return (new MailMessage)
            ->subject("Payment Failed — {$order->order_number}")
            ->greeting("Hi {$order->shipping_name},")
            ->line("We couldn't process payment for order {$order->order_number}.")
            ->line('Reason: '.($this->payment->failure_reason ?? 'Payment was not completed.'))
            ->action('View order', $order->viewUrl());
    }

    public function toSms(object $notifiable): SmsMessage
    {
        $order = $this->payment->order;

        return new SmsMessage(
            to: $order->shipping_phone,
            content: "Payment for order {$order->order_number} failed. Please retry from your account.",
        );
    }

    public function toWhatsApp(object $notifiable): WhatsAppMessage
    {
        $order = $this->payment->order;

        return new WhatsAppMessage(
            to: $order->shipping_phone,
            content: "Payment for order {$order->order_number} failed. Please retry from your account.",
        );
    }
}
