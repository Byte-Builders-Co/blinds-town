<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\StockStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->filled('from') ? Carbon::parse($request->string('from')->toString())->startOfDay() : now()->subDays(29)->startOfDay();
        $to = $request->filled('to') ? Carbon::parse($request->string('to')->toString())->endOfDay() : now()->endOfDay();
        $sort = $request->string('sort', 'units')->toString() === 'revenue' ? 'revenue' : 'units';

        return Inertia::render('admin/reports/index', [
            'filters' => ['from' => $from->toDateString(), 'to' => $to->toDateString(), 'sort' => $sort],
            'sales' => $this->salesSummary($from, $to),
            'orders' => $this->orderCounts(),
            'revenue' => $this->revenueSummary($from, $to),
            'products' => $this->productCounts(),
            'customers' => $this->customerCounts($from, $to),
            'bestSellers' => $this->bestSellers($from, $to, $sort),
        ]);
    }

    /**
     * @return array{today: float, this_week: float, this_month: float, range: float}
     */
    private function salesSummary(CarbonInterface $from, CarbonInterface $to): array
    {
        $notCancelled = fn () => Order::query()->where('status', '!=', OrderStatus::Cancelled->value);

        return [
            'today' => (float) $notCancelled()->whereDate('created_at', now()->toDateString())->sum('total'),
            'this_week' => (float) $notCancelled()->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->sum('total'),
            'this_month' => (float) $notCancelled()->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->sum('total'),
            'range' => (float) $notCancelled()->whereBetween('created_at', [$from, $to])->sum('total'),
        ];
    }

    /**
     * @return array{total: int, by_status: array<string, int>}
     */
    private function orderCounts(): array
    {
        $byStatus = Order::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return [
            'total' => (int) $byStatus->sum(),
            'by_status' => collect(OrderStatus::cases())
                ->mapWithKeys(fn (OrderStatus $status) => [$status->value => (int) ($byStatus[$status->value] ?? 0)])
                ->all(),
        ];
    }

    /**
     * @return array{gross: float, discounts: float, tax: float, shipping: float, installation: float, net: float}
     */
    private function revenueSummary(CarbonInterface $from, CarbonInterface $to): array
    {
        $row = Order::query()
            ->where('status', '!=', OrderStatus::Cancelled->value)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('
                coalesce(sum(subtotal), 0) as gross,
                coalesce(sum(discount_amount), 0) as discounts,
                coalesce(sum(tax_amount), 0) as tax,
                coalesce(sum(shipping_charge), 0) as shipping,
                coalesce(sum(installation_charge), 0) as installation,
                coalesce(sum(total), 0) as net
            ')
            ->first()
            ?->getAttributes() ?? [];

        return [
            'gross' => (float) ($row['gross'] ?? 0),
            'discounts' => (float) ($row['discounts'] ?? 0),
            'tax' => (float) ($row['tax'] ?? 0),
            'shipping' => (float) ($row['shipping'] ?? 0),
            'installation' => (float) ($row['installation'] ?? 0),
            'net' => (float) ($row['net'] ?? 0),
        ];
    }

    /**
     * @return array{total: int, active: int, out_of_stock: int}
     */
    private function productCounts(): array
    {
        return [
            'total' => Product::query()->count(),
            'active' => Product::query()->where('is_active', true)->count(),
            'out_of_stock' => Product::query()->where('stock_status', StockStatus::OutOfStock->value)->count(),
        ];
    }

    /**
     * @return array{total: int, new: int, returning: int}
     */
    private function customerCounts(CarbonInterface $from, CarbonInterface $to): array
    {
        $customerIds = User::role('customer')->pluck('id');

        $returning = Order::query()
            ->whereIn('user_id', $customerIds)
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('count(*) > 1')
            ->count('user_id');

        return [
            'total' => $customerIds->count(),
            'new' => User::role('customer')->whereBetween('created_at', [$from, $to])->count(),
            'returning' => $returning,
        ];
    }

    /**
     * @return array<int, array{product_id: int, name: string, units_sold: int, revenue: float}>
     */
    private function bestSellers(CarbonInterface $from, CarbonInterface $to, string $sort): array
    {
        $rows = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', OrderStatus::Cancelled->value)
            ->whereBetween('orders.created_at', [$from, $to])
            ->select('order_items.product_id', 'order_items.product_name')
            ->selectRaw('sum(order_items.quantity) as units_sold, sum(order_items.line_total) as revenue')
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc($sort === 'revenue' ? 'revenue' : 'units_sold')
            ->limit(10)
            ->get();

        return $rows->map(function (OrderItem $row) {
            $attributes = $row->getAttributes();

            return [
                'product_id' => (int) $attributes['product_id'],
                'name' => $attributes['product_name'],
                'units_sold' => (int) $attributes['units_sold'],
                'revenue' => (float) $attributes['revenue'],
            ];
        })->all();
    }
}
