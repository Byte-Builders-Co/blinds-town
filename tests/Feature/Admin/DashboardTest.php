<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\StockStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    // Midday keeps "today" bucket and day-boundary assertions stable.
    $this->travelTo(now()->setDate(2026, 10, 15)->setTime(12, 0));
});

/**
 * Approximate float equality for Inertia prop assertions (JSON floats).
 */
function dashboardApprox(float $expected): Closure
{
    return fn ($actual) => abs((float) $actual - $expected) < 0.005;
}

/**
 * A non-cancelled order of the given total placed N days ago.
 */
function dashboardOrder(float $total, int $daysAgo = 0, array $attributes = []): Order
{
    return Order::factory()->confirmed()->create([
        'subtotal' => $total,
        'total' => $total,
        'created_at' => now()->subDays($daysAgo),
        ...$attributes,
    ]);
}

test('guests are redirected to login', function () {
    $this->get('/admin/dashboard')->assertRedirect(route('login'));
});

test('customers cannot open the dashboard', function () {
    $this->actingAs(User::factory()->create())->get('/admin/dashboard')->assertForbidden();
});

test('staff and admins can open the dashboard', function (string $role) {
    $user = User::factory()->{$role}()->create();

    $this->actingAs($user)->get('/admin/dashboard')->assertOk();
})->with(['admin', 'staff']);

test('the dashboard defaults to the last 30 days with one point per day', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/dashboard')->assertInertia(fn (AssertableInertia $page) => $page
        ->component('admin/dashboard')
        ->where('range.key', 'today')
        ->where('range.from', '2026-10-15')
        ->where('range.to', '2026-10-15')
        ->where('currency', 'USD')
        ->has('sales.points', 1));
});

test('each preset produces the expected number of chart points', function (string $range, int $points, string $granularity) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get("/admin/dashboard?range={$range}")->assertInertia(fn (AssertableInertia $page) => $page
        ->where('range.key', $range)
        ->where('sales.granularity', $granularity)
        ->has('sales.points', $points));
})->with([
    ['today', 1, 'day'],
    ['7d', 7, 'day'],
    ['30d', 30, 'day'],
    ['3m', 13, 'week'],
    ['12m', 12, 'month'],
]);

test('a custom range is honoured and an unusable one falls back', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/dashboard?range=custom&from=2026-09-01&to=2026-09-10')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('range.key', 'custom')
            ->where('range.from', '2026-09-01')
            ->where('range.to', '2026-09-10')
            ->has('sales.points', 10));

    $this->actingAs($admin)->get('/admin/dashboard?range=custom&from=nope&to=2026-09-10')
        ->assertInertia(fn (AssertableInertia $page) => $page->where('range.key', 'today'));
});

test('revenue and orders cover the selected period and ignore cancelled orders', function () {
    $admin = User::factory()->admin()->create();
    dashboardOrder(100);
    dashboardOrder(50, daysAgo: 3);
    dashboardOrder(999, daysAgo: 1, attributes: ['status' => OrderStatus::Cancelled]);
    dashboardOrder(400, daysAgo: 40);

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('kpis.revenue.value', dashboardApprox(150))
        ->where('kpis.revenue.lifetime', dashboardApprox(550))
        ->where('kpis.orders.value', 2)
        ->where('kpis.orders.lifetime', 3)
        ->where('kpis.orders.cancelled', 1)
        ->where('sales.summary.average_order_value', dashboardApprox(75)));
});

test('figures are compared with the previous period', function () {
    $admin = User::factory()->admin()->create();
    dashboardOrder(150);
    dashboardOrder(100, daysAgo: 35);
    dashboardOrder(100, daysAgo: 40);

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('sales.summary.previous_revenue', dashboardApprox(200))
        ->where('sales.summary.revenue_change', dashboardApprox(-25))
        ->where('sales.summary.orders_change', dashboardApprox(-50))
        ->where('sales.summary.average_order_value_change', dashboardApprox(50)));
});

test('the change is null when the previous period had no sales', function () {
    $admin = User::factory()->admin()->create();
    dashboardOrder(80);

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('sales.summary.revenue_change', null)
        ->where('kpis.revenue.change', null));
});

test('orders land in the right daily bucket and the previous period lines up', function () {
    $admin = User::factory()->admin()->create();
    dashboardOrder(100);
    dashboardOrder(60, daysAgo: 2);
    dashboardOrder(30, daysAgo: 7);

    $this->actingAs($admin)->get('/admin/dashboard?range=7d')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('sales.points.6.label', 'Oct 15')
        ->where('sales.points.6.revenue', dashboardApprox(100))
        ->where('sales.points.6.orders', 1)
        ->where('sales.points.4.revenue', dashboardApprox(60))
        ->where('sales.points.5.revenue', dashboardApprox(0))
        // The previous period is Oct 2-8, so Oct 8 (7 days ago) is its last bucket.
        ->where('sales.points.6.previous_revenue', dashboardApprox(30))
        ->where('sales.points.6.previous_title', 'Thu, Oct 8, 2026')
        ->where('sales.points.0.previous_title', 'Fri, Oct 2, 2026'));
});

test('the today range is a single day compared with yesterday', function () {
    $admin = User::factory()->admin()->create();
    dashboardOrder(70, attributes: ['created_at' => now()->setTime(9, 30)]);
    dashboardOrder(30, attributes: ['created_at' => now()->setTime(9, 45)]);
    dashboardOrder(50, daysAgo: 1);

    $this->actingAs($admin)->get('/admin/dashboard?range=today')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('sales.points', 1)
        ->where('sales.points.0.revenue', dashboardApprox(100))
        ->where('sales.points.0.orders', 2)
        ->where('sales.points.0.previous_revenue', dashboardApprox(50))
        ->where('sales.summary.revenue_change', dashboardApprox(100)));
});

test('weekly and monthly ranges roll daily totals into their buckets', function () {
    $admin = User::factory()->admin()->create();
    dashboardOrder(10, daysAgo: 0);
    dashboardOrder(20, daysAgo: 1);
    dashboardOrder(40, daysAgo: 20);

    $this->actingAs($admin)->get('/admin/dashboard?range=3m')->assertInertia(fn (AssertableInertia $page) => $page
        // Weeks run from the range start (Jul 17): Oct 14-15 are days 89-90 => the
        // last week, and Sep 25 is day 70 => week 10.
        ->where('sales.points.12.revenue', dashboardApprox(30))
        ->where('sales.points.12.orders', 2)
        ->where('sales.points.10.revenue', dashboardApprox(40)));

    $this->actingAs($admin)->get('/admin/dashboard?range=12m')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('sales.points.11.label', 'Oct')
        ->where('sales.points.11.revenue', dashboardApprox(30))
        ->where('sales.points.10.label', 'Sep')
        ->where('sales.points.10.revenue', dashboardApprox(40)));
});

test('top products are ranked by revenue with their trend', function () {
    $admin = User::factory()->admin()->create();
    $roller = Product::factory()->create(['name' => 'Roller Blind', 'image_path' => 'products/roller.jpg']);
    $roman = Product::factory()->create(['name' => 'Roman Blind']);

    $current = dashboardOrder(500);
    OrderItem::factory()->for($current)->for($roller)->create(['quantity' => 2, 'line_total' => 300]);
    OrderItem::factory()->for($current)->for($roman)->create(['quantity' => 1, 'line_total' => 200]);
    $second = dashboardOrder(100, daysAgo: 2);
    OrderItem::factory()->for($second)->for($roller)->create(['quantity' => 1, 'line_total' => 100]);

    $earlier = dashboardOrder(200, daysAgo: 35);
    OrderItem::factory()->for($earlier)->for($roller)->create(['quantity' => 1, 'line_total' => 200]);
    $cancelled = dashboardOrder(900, attributes: ['status' => OrderStatus::Cancelled]);
    OrderItem::factory()->for($cancelled)->for($roman)->create(['quantity' => 9, 'line_total' => 900]);

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('topProducts', 2)
        ->where('topProducts.0.name', 'Roller Blind')
        ->where('topProducts.0.image_path', 'products/roller.jpg')
        ->where('topProducts.0.orders', 2)
        ->where('topProducts.0.units', 3)
        ->where('topProducts.0.revenue', dashboardApprox(400))
        ->where('topProducts.0.change', dashboardApprox(100))
        ->where('topProducts.1.name', 'Roman Blind')
        ->where('topProducts.1.units', 1)
        ->where('topProducts.1.change', null));
});

test('category sales roll sub-categories up into their parent', function () {
    $admin = User::factory()->admin()->create();
    $roller = Category::factory()->create(['name' => 'Roller Blinds']);
    $rollerChild = Category::factory()->create(['name' => 'Dim-out Roller', 'parent_id' => $roller->id]);
    $zebra = Category::factory()->create(['name' => 'Zebra Blinds']);

    $order = dashboardOrder(600);
    OrderItem::factory()->for($order)->for(Product::factory()->for($roller)->create())->create(['quantity' => 2, 'line_total' => 200]);
    OrderItem::factory()->for($order)->for(Product::factory()->for($rollerChild)->create())->create(['quantity' => 3, 'line_total' => 300]);
    OrderItem::factory()->for($order)->for(Product::factory()->for($zebra)->create())->create(['quantity' => 1, 'line_total' => 100]);

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('categories', 2)
        ->where('categories.0.name', 'Roller Blinds')
        // Both roller lines sit in the same order, so it counts once.
        ->where('categories.0.orders', 1)
        ->where('categories.0.units', 5)
        ->where('categories.0.revenue', dashboardApprox(500))
        ->where('categories.1.name', 'Zebra Blinds')
        ->where('categories.1.revenue', dashboardApprox(100)));
});

test('customer figures count registrations in the period against the one before', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(3)->create(['created_at' => now()->subDays(2)]);
    User::factory()->count(1)->create(['created_at' => now()->subDays(40)]);

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('kpis.customers.total', 4)
        ->where('kpis.customers.new', 3)
        ->where('kpis.customers.previous_new', 1)
        ->where('kpis.customers.change', dashboardApprox(200))
        ->where('kpis.customers.trend.27', 3));
});

test('product figures separate active and out of stock products', function () {
    $admin = User::factory()->admin()->create();
    Product::factory()->create(['is_active' => true, 'stock_status' => StockStatus::InStock]);
    Product::factory()->create(['is_active' => true, 'stock_status' => StockStatus::OutOfStock]);
    Product::factory()->create(['is_active' => false, 'stock_status' => StockStatus::InStock]);

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('kpis.products.total', 3)
        ->where('kpis.products.active', 2)
        ->where('kpis.products.out_of_stock', 1));
});

test('recent orders list the newest first with customer, product and payment status', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create(['first_name' => 'Asha', 'last_name' => 'Rao']);

    $old = dashboardOrder(10, daysAgo: 5);
    $new = dashboardOrder(55, daysAgo: 0, attributes: ['user_id' => $customer->id]);
    OrderItem::factory()->for($new)->create(['product_name' => 'Zebra Blind']);
    OrderItem::factory()->for($new)->create(['product_name' => 'Roman Blind']);
    Payment::factory()->for($new)->paid()->create();

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('recentOrders.0.id', $new->id)
        ->where('recentOrders.0.customer_name', 'Asha Rao')
        ->where('recentOrders.0.product', 'Zebra Blind')
        ->where('recentOrders.0.extra_items', 1)
        ->where('recentOrders.0.payment_status', PaymentStatus::Paid->value)
        ->where('recentOrders.0.status', OrderStatus::Confirmed->value)
        ->where('recentOrders.1.id', $old->id)
        ->where('recentOrders.1.payment_status', null));
});

test('recent orders are capped at eight and include guest checkouts', function () {
    $admin = User::factory()->admin()->create();
    Order::factory()->count(9)->create(['user_id' => null, 'guest_email' => 'guest@example.com', 'shipping_name' => 'Guest Buyer']);

    $this->actingAs($admin)->get('/admin/dashboard?range=30d')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('recentOrders', 8)
        ->where('recentOrders.0.customer_name', 'Guest Buyer')
        ->where('recentOrders.0.customer_email', 'guest@example.com'));
});

test('the activity feed merges recent store events, newest first', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create(['created_at' => now()->subHours(5)]);
    $order = dashboardOrder(80, attributes: ['user_id' => $customer->id, 'created_at' => now()->subHours(3), 'shipped_at' => now()->subHour(), 'carrier' => 'DHL']);
    Payment::factory()->for($order)->paid()->create(['amount' => 80, 'paid_at' => now()->subHours(2)]);
    Product::factory()->create(['name' => 'Fresh Blind', 'created_at' => now()->subMinutes(10), 'updated_at' => now()->subMinutes(10)]);

    $types = collect($this->actingAs($admin)->get('/admin/dashboard')->inertiaProps('activity'))->pluck('type')->all();

    expect($types)->toBe([
        'product_added',
        'order_shipped',
        'payment_received',
        'order_received',
        'customer_registered',
    ]);
});

test('a date-range change can reload just the range dependent panels', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/dashboard?range=7d')->assertInertia(fn (AssertableInertia $page) => $page
        ->reloadOnly(['range', 'kpis', 'sales'], fn (AssertableInertia $reload) => $reload
            ->where('range.key', '7d')
            ->has('kpis.revenue')
            ->has('sales.points', 7)
            ->missing('recentOrders')
            ->missing('activity')
            ->missing('lowStock')));
});
