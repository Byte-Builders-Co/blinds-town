<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $notCancelled = fn () => Order::query()->where('status', '!=', OrderStatus::Cancelled->value);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_orders' => Order::query()->count(),
                'total_revenue' => (float) $notCancelled()->sum('total'),
                'orders_today' => $notCancelled()->whereDate('created_at', now()->toDateString())->count(),
                'revenue_today' => (float) $notCancelled()->whereDate('created_at', now()->toDateString())->sum('total'),
                'total_customers' => User::role('customer')->count(),
                'total_products' => Product::query()->count(),
                'total_categories' => Category::query()->count(),
            ],
        ]);
    }
}
