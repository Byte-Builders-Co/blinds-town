<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Messages\SmsMessage;
use App\Notifications\Messages\WhatsAppMessage;
use App\Services\Notifications\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Order $order,
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
        return (new MailMessage)
            ->subject("Order Update — {$this->order->order_number}")
            ->greeting("Hi {$this->order->shipping_name},")
            ->line("Your order {$this->order->order_number} is now: {$this->order->status->label()}.")
            ->action('View your order', $this->order->viewUrl());
    }

    public function toSms(object $notifiable): SmsMessage
    {
        return new SmsMessage(
            to: $this->order->shipping_phone,
            content: "Order {$this->order->order_number} is now: {$this->order->status->label()}.",
        );
    }

    public function toWhatsApp(object $notifiable): WhatsAppMessage
    {
        return new WhatsAppMessage(
            to: $this->order->shipping_phone,
            content: "Order {$this->order->order_number} is now: {$this->order->status->label()}.",
        );
    }
}
