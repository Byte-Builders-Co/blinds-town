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

class OrderConfirmationNotification extends Notification implements ShouldQueue
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
            ->subject("Order Confirmed — {$this->order->order_number}")
            ->greeting("Thanks for your order, {$this->order->shipping_name}!")
            ->line("Your order {$this->order->order_number} has been confirmed and payment received.")
            ->line('Total: '.strtoupper($this->order->currency).' '.number_format((float) $this->order->total, 2))
            ->action('View your order', route('orders.show', $this->order))
            ->line('We will let you know once your blinds have shipped.');
    }

    public function toSms(object $notifiable): SmsMessage
    {
        return new SmsMessage(
            to: $this->order->shipping_phone,
            content: "Order {$this->order->order_number} confirmed. Total: ".strtoupper($this->order->currency).' '.number_format((float) $this->order->total, 2),
        );
    }

    public function toWhatsApp(object $notifiable): WhatsAppMessage
    {
        return new WhatsAppMessage(
            to: $this->order->shipping_phone,
            content: "Order {$this->order->order_number} confirmed. Total: ".strtoupper($this->order->currency).' '.number_format((float) $this->order->total, 2),
        );
    }
}
