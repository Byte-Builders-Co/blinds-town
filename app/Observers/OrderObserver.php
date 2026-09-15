<?php

namespace App\Observers;

use App\Enums\AdminAlertType;
use App\Models\Order;
use App\Services\AdminAlertService;
use App\Services\Notifications\NotificationService;

class OrderObserver
{
    public function __construct(
        private readonly AdminAlertService $alerts,
        private readonly NotificationService $notifications,
    ) {}

    public function created(Order $order): void
    {
        if (! $this->notifications->isEventEnabled('order_created')) {
            return;
        }

        $this->alerts->create(
            AdminAlertType::NewOrder,
            "New order — {$order->order_number}",
            'Total: '.strtoupper($order->currency).' '.number_format((float) $order->total, 2),
            route('admin.orders.show', $order),
        );
    }
}
