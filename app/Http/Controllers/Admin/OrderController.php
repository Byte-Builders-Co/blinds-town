<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRefundRequest;
use App\Http\Requests\Admin\UpdateOrderTrackingRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Notifications\OrderStatusUpdatedNotification;
use App\Services\Notifications\NotificationService;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/orders/index', [
            'orders' => Order::query()
                ->with(['user', 'payment'])
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->when($request->string('payment_status')->toString(), fn ($query, $status) => $query->whereHas('payment', fn ($q) => $q->where('status', $status)))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'statuses' => OrderStatus::cases(),
            'paymentStatuses' => PaymentStatus::cases(),
            'filters' => $request->only(['status', 'payment_status']),
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $order->load(['items', 'user', 'payment.refunds', 'statusHistories']),
            'statuses' => OrderStatus::cases(),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order, NotificationService $notifications): RedirectResponse
    {
        $status = OrderStatus::from($request->validated('status'));
        $order->recordStatus($status, $request->validated('note'));

        $event = match ($status) {
            OrderStatus::Shipped => 'order_shipped',
            OrderStatus::Delivered => 'order_delivered',
            default => null,
        };

        if ($event === null || $notifications->isEventEnabled($event)) {
            $order->user->notify(new OrderStatusUpdatedNotification($order));
        }

        return redirect()->route('admin.orders.show', $order);
    }

    public function updateTracking(UpdateOrderTrackingRequest $request, Order $order): RedirectResponse
    {
        $order->update([
            'carrier' => $request->validated('carrier'),
            'tracking_number' => $request->validated('tracking_number'),
            'shipped_at' => $order->shipped_at ?? now(),
        ]);

        return redirect()->route('admin.orders.show', $order);
    }

    public function refund(StoreRefundRequest $request, Order $order, PaymentService $payments): RedirectResponse
    {
        abort_unless($order->payment && $order->payment->status === PaymentStatus::Paid, 422, 'This order has no paid payment to refund.');

        $payments->refund($order->payment, (float) $request->validated('amount'), $request->validated('reason'));

        return redirect()->route('admin.orders.show', $order);
    }
}
