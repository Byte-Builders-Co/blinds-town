<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackOrderController extends Controller
{
    /**
     * Public order lookup by the tracking number an admin attached to the
     * order. Only delivery progress is exposed, never addresses or payment.
     */
    public function show(Request $request): Response
    {
        $trackingNumber = trim($request->string('tracking_number')->toString());
        $order = null;

        if ($trackingNumber !== '') {
            $order = Order::query()
                ->where('tracking_number', $trackingNumber)
                ->with(['items:id,order_id,product_name,quantity', 'statusHistories'])
                ->first();
        }

        return Inertia::render('orders/track', [
            'trackingNumber' => $trackingNumber,
            'searched' => $trackingNumber !== '',
            'order' => $order === null ? null : [
                ...$order->only(['order_number', 'status', 'tracking_number', 'shipped_at', 'delivered_at', 'created_at']),
                'items' => $order->items,
                'statusHistories' => $order->statusHistories,
            ],
        ]);
    }
}
