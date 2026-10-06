<?php

namespace App\Services\Dashboard;

use App\Enums\OrderStatus;
use App\Enums\StockStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Database\Query\Builder;

/**
 * Computes every figure on the admin dashboard from real order, customer and
 * inventory data. Revenue follows the Reports module: every order that has not
 * been cancelled counts. Each figure is compared with the equally long period
 * before the selected one, and results are memoized for the request so the
 * KPI cards and charts always agree with each other.
 */
class DashboardService
{
    private const TOP_PRODUCTS = 6;

    private const TOP_CATEGORIES = 12;

    private const RECENT_ORDERS = 8;

    /** @var array<string, mixed> */
    private array $memo = [];

    public function currency(): string
    {
        return strtoupper((string) Setting::get('store.currency', 'usd'));
    }

    /**
     * Revenue and orders over time, with the previous period alongside.
     *
     * @return array{
     *     granularity: string,
     *     points: list<array<string, mixed>>,
     *     summary: array<string, float|int|null>,
     * }
     */
    public function sales(DashboardRange $range): array
    {
        return $this->remember('sales', $range, function () use ($range) {
            $buckets = new TimeBuckets($range->from, $range->to, $range->granularity);
            $previousBuckets = new TimeBuckets($range->previousFrom, $range->previousTo, $range->granularity);

            $current = $this->orderSeries($buckets, $range->from, $range->to);
            $previous = $this->orderSeries($previousBuckets, $range->previousFrom, $range->previousTo);

            $points = [];

            for ($i = 0; $i < $buckets->count(); $i++) {
                $hasPrevious = $i < $previousBuckets->count();

                $points[] = [
                    'label' => $buckets->label($i),
                    'title' => $buckets->title($i),
                    'revenue' => round($current['revenue'][$i], 2),
                    'orders' => $current['orders'][$i],
                    'previous_title' => $hasPrevious ? $previousBuckets->title($i) : null,
                    'previous_revenue' => $hasPrevious ? round($previous['revenue'][$i], 2) : null,
                    'previous_orders' => $hasPrevious ? $previous['orders'][$i] : null,
                ];
            }

            $revenue = array_sum($current['revenue']);
            $orders = array_sum($current['orders']);
            $previousRevenue = array_sum($previous['revenue']);
            $previousOrders = array_sum($previous['orders']);
            $averageOrderValue = $orders > 0 ? $revenue / $orders : 0.0;
            $previousAverageOrderValue = $previousOrders > 0 ? $previousRevenue / $previousOrders : 0.0;

            return [
                'granularity' => $range->granularity->value,
                'points' => $points,
                'summary' => [
                    'revenue' => round($revenue, 2),
                    'orders' => $orders,
                    'average_order_value' => round($averageOrderValue, 2),
                    'previous_revenue' => round($previousRevenue, 2),
                    'previous_orders' => $previousOrders,
                    'previous_average_order_value' => round($previousAverageOrderValue, 2),
                    'revenue_change' => $this->change($revenue, $previousRevenue),
                    'orders_change' => $this->change($orders, $previousOrders),
                    'average_order_value_change' => $this->change($averageOrderValue, $previousAverageOrderValue),
                ],
            ];
        });
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function kpis(DashboardRange $range): array
    {
        return $this->remember('kpis', $range, function () use ($range) {
            $sales = $this->sales($range);
            $summary = $sales['summary'];
            $customers = $this->newCustomers($range);

            $lifetime = $this->validOrders()
                ->selectRaw('coalesce(sum(orders.total), 0) as revenue, count(*) as orders')
                ->first();

            $status = Order::query()->toBase()
                ->whereBetween('orders.created_at', [$range->from, $range->to])
                ->selectRaw('coalesce(sum(case when orders.status = ? then 1 else 0 end), 0) as pending, coalesce(sum(case when orders.status = ? then 1 else 0 end), 0) as cancelled', [
                    OrderStatus::Pending->value,
                    OrderStatus::Cancelled->value,
                ])
                ->first();

            return [
                'revenue' => [
                    'value' => $summary['revenue'],
                    'previous' => $summary['previous_revenue'],
                    'change' => $summary['revenue_change'],
                    'lifetime' => round((float) $lifetime->revenue, 2),
                    'trend' => array_column($sales['points'], 'revenue'),
                ],
                'orders' => [
                    'value' => $summary['orders'],
                    'previous' => $summary['previous_orders'],
                    'change' => $summary['orders_change'],
                    'lifetime' => (int) $lifetime->orders,
                    'pending' => (int) $status->pending,
                    'cancelled' => (int) $status->cancelled,
                    'trend' => array_column($sales['points'], 'orders'),
                ],
                'customers' => [
                    'total' => User::role('customer')->count(),
                    'new' => $customers['current'],
                    'previous_new' => $customers['previous'],
                    'change' => $this->change($customers['current'], $customers['previous']),
                    'trend' => $customers['series'],
                ],
                'products' => [
                    'total' => Product::query()->count(),
                    'active' => Product::query()->where('is_active', true)->count(),
                    'out_of_stock' => Product::query()->where('stock_status', StockStatus::OutOfStock->value)->count(),
                ],
            ];
        });
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function topProducts(DashboardRange $range): array
    {
        return $this->remember('top-products', $range, function () use ($range) {
            $rows = $this->orderItems($range->from, $range->to)
                ->leftJoin('products', 'products.id', '=', 'order_items.product_id')
                ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
                ->whereNotNull('order_items.product_id')
                ->groupBy('order_items.product_id')
                ->selectRaw('
                    order_items.product_id,
                    max(order_items.product_name) as item_name,
                    max(products.name) as product_name,
                    max(products.image_path) as image_path,
                    max(categories.name) as category_name,
                    count(distinct order_items.order_id) as orders,
                    coalesce(sum(order_items.quantity), 0) as units,
                    coalesce(sum(order_items.line_total), 0) as revenue
                ')
                ->orderByDesc('revenue')
                ->orderByDesc('units')
                ->limit(self::TOP_PRODUCTS)
                ->get();

            if ($rows->isEmpty()) {
                return [];
            }

            $previousRevenue = $this->orderItems($range->previousFrom, $range->previousTo)
                ->whereIn('order_items.product_id', $rows->pluck('product_id')->all())
                ->groupBy('order_items.product_id')
                ->selectRaw('order_items.product_id, coalesce(sum(order_items.line_total), 0) as revenue')
                ->pluck('revenue', 'product_id');

            return $rows->map(fn (object $row) => [
                'product_id' => (int) $row->product_id,
                'name' => $row->product_name ?? $row->item_name,
                'category' => $row->category_name,
                'image_path' => $row->image_path,
                'orders' => (int) $row->orders,
                'units' => (int) $row->units,
                'revenue' => round((float) $row->revenue, 2),
                'change' => $this->change((float) $row->revenue, (float) ($previousRevenue[$row->product_id] ?? 0)),
            ])->all();
        });
    }

    /**
     * Sales per top-level category; sub-categories roll up into their parent.
     *
     * @return list<array{category_id: int, name: string, orders: int, units: int, revenue: float}>
     */
    public function categorySales(DashboardRange $range): array
    {
        return $this->remember('categories', $range, function () use ($range) {
            return $this->orderItems($range->from, $range->to)
                ->join('products', 'products.id', '=', 'order_items.product_id')
                ->join('categories', 'categories.id', '=', 'products.category_id')
                ->leftJoin('categories as parents', 'parents.id', '=', 'categories.parent_id')
                ->groupByRaw('coalesce(parents.id, categories.id), coalesce(parents.name, categories.name)')
                ->selectRaw('
                    coalesce(parents.id, categories.id) as category_id,
                    coalesce(parents.name, categories.name) as category_name,
                    count(distinct order_items.order_id) as orders,
                    coalesce(sum(order_items.quantity), 0) as units,
                    coalesce(sum(order_items.line_total), 0) as revenue
                ')
                ->orderByDesc('revenue')
                ->limit(self::TOP_CATEGORIES)
                ->get()
                ->map(fn (object $row) => [
                    'category_id' => (int) $row->category_id,
                    'name' => $row->category_name,
                    'orders' => (int) $row->orders,
                    'units' => (int) $row->units,
                    'revenue' => round((float) $row->revenue, 2),
                ])
                ->all();
        });
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function recentOrders(): array
    {
        return Order::query()
            ->with(['user', 'payment', 'items:id,order_id,product_name'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(self::RECENT_ORDERS)
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->user?->name ?? $order->shipping_name,
                'customer_email' => $order->customerEmail(),
                'product' => $order->items->first()?->product_name,
                'extra_items' => max(0, $order->items->count() - 1),
                'total' => (float) $order->total,
                'status' => $order->status->value,
                'payment_status' => $order->payment?->status->value,
                'created_at' => $order->created_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * New customer registrations per bucket, plus the previous period's total.
     *
     * @return array{series: list<int>, current: int, previous: int}
     */
    private function newCustomers(DashboardRange $range): array
    {
        return $this->remember('new-customers', $range, function () use ($range) {
            $buckets = new TimeBuckets($range->from, $range->to, $range->granularity);
            $series = array_fill(0, $buckets->count(), 0);

            $rows = User::role('customer')
                ->whereBetween('users.created_at', [$range->from, $range->to])
                ->toBase()
                ->selectRaw($buckets->groupExpression('users.created_at').' as bucket, count(*) as aggregate')
                ->groupBy('bucket')
                ->get();

            foreach ($rows as $row) {
                $index = $buckets->indexFor($row->bucket);

                if ($index !== null) {
                    $series[$index] += (int) $row->aggregate;
                }
            }

            return [
                'series' => $series,
                'current' => array_sum($series),
                'previous' => User::role('customer')->whereBetween('users.created_at', [$range->previousFrom, $range->previousTo])->count(),
            ];
        });
    }

    /**
     * @return array{revenue: list<float>, orders: list<int>}
     */
    private function orderSeries(TimeBuckets $buckets, CarbonInterface $from, CarbonInterface $to): array
    {
        $revenue = array_fill(0, $buckets->count(), 0.0);
        $orders = array_fill(0, $buckets->count(), 0);

        $rows = $this->validOrders($from, $to)
            ->selectRaw($buckets->groupExpression('orders.created_at').' as bucket, coalesce(sum(orders.total), 0) as revenue, count(*) as orders')
            ->groupBy('bucket')
            ->get();

        foreach ($rows as $row) {
            $index = $buckets->indexFor($row->bucket);

            if ($index !== null) {
                $revenue[$index] += (float) $row->revenue;
                $orders[$index] += (int) $row->orders;
            }
        }

        return ['revenue' => $revenue, 'orders' => $orders];
    }

    /**
     * Orders that count towards sales (everything except cancelled orders),
     * optionally limited to a date range.
     */
    private function validOrders(?CarbonInterface $from = null, ?CarbonInterface $to = null): Builder
    {
        return Order::query()->toBase()
            ->where('orders.status', '!=', OrderStatus::Cancelled->value)
            ->when($from !== null && $to !== null, fn (Builder $query) => $query->whereBetween('orders.created_at', [$from, $to]));
    }

    /**
     * Line items of valid orders placed in the range.
     */
    private function orderItems(CarbonInterface $from, CarbonInterface $to): Builder
    {
        return OrderItem::query()->toBase()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', OrderStatus::Cancelled->value)
            ->whereBetween('orders.created_at', [$from, $to]);
    }

    /**
     * Percentage change from $previous to $current, or null when there is
     * nothing to compare against.
     */
    private function change(float|int $current, float|int $previous): ?float
    {
        if ($previous == 0) {
            return null;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

    private function remember(string $name, DashboardRange $range, Closure $callback): mixed
    {
        return $this->memo[$name.':'.spl_object_id($range)] ??= $callback();
    }
}
