<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Order::class);

        return Inertia::render('orders/index', [
            'orders' => $request->user()->orders()
                ->with('payment')
                ->withCount('items')
                ->latest()
                ->paginate(10),
        ]);
    }

    public function show(Order $order): Response
    {
        $this->authorize('view', $order);

        return Inertia::render('orders/show', [
            'order' => $order->load(['items', 'payment.refunds', 'statusHistories']),
        ]);
    }

    public function invoice(Order $order): Response
    {
        $this->authorize('view', $order);

        return Inertia::render('orders/invoice', [
            'order' => $order->load(['items', 'payment', 'user']),
        ]);
    }
}
