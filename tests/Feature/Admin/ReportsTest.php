<?php

use App\Enums\OrderStatus;
use App\Enums\StockStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

test('guests cannot access reports', function () {
    $response = $this->get('/admin/reports');

    $response->assertRedirect(route('login'));
});

test('customers cannot access reports', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/reports');

    $response->assertForbidden();
});

test('admins can view the reports dashboard', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get('/admin/reports');

    $response->assertOk();
});

test('sales and revenue totals exclude cancelled orders', function () {
    $admin = User::factory()->admin()->create();
    Order::factory()->confirmed()->create(['subtotal' => 100, 'total' => 100, 'created_at' => now()]);
    Order::factory()->create(['status' => OrderStatus::Cancelled, 'subtotal' => 999, 'total' => 999, 'created_at' => now()]);

    $response = $this->actingAs($admin)->get('/admin/reports');

    $response->assertInertia(fn ($page) => $page
        ->where('sales.today', fn ($value) => (float) $value === 100.0)
        ->where('revenue.gross', fn ($value) => (float) $value === 100.0));
});

test('order counts are broken down by status', function () {
    $admin = User::factory()->admin()->create();
    Order::factory()->count(2)->create(['status' => OrderStatus::Pending]);
    Order::factory()->confirmed()->create();
    Order::factory()->create(['status' => OrderStatus::Cancelled]);

    $response = $this->actingAs($admin)->get('/admin/reports');

    $response->assertInertia(fn ($page) => $page
        ->where('orders.total', 4)
        ->where('orders.by_status.pending', 2)
        ->where('orders.by_status.confirmed', 1)
        ->where('orders.by_status.cancelled', 1));
});

test('product counts reflect active and out of stock products', function () {
    $admin = User::factory()->admin()->create();
    Product::factory()->create(['is_active' => true, 'stock_status' => StockStatus::InStock]);
    Product::factory()->create(['is_active' => false, 'stock_status' => StockStatus::OutOfStock]);

    $response = $this->actingAs($admin)->get('/admin/reports');

    $response->assertInertia(fn ($page) => $page
        ->where('products.total', 2)
        ->where('products.active', 1)
        ->where('products.out_of_stock', 1));
});

test('best sellers are ranked by units sold and revenue', function () {
    $admin = User::factory()->admin()->create();
    $productA = Product::factory()->create(['name' => 'Roller Blind']);
    $productB = Product::factory()->create(['name' => 'Roman Blind']);

    $orderA = Order::factory()->confirmed()->create();
    OrderItem::factory()->for($orderA)->for($productA)->create(['product_name' => 'Roller Blind', 'quantity' => 5, 'line_total' => 500]);

    $orderB = Order::factory()->confirmed()->create();
    OrderItem::factory()->for($orderB)->for($productB)->create(['product_name' => 'Roman Blind', 'quantity' => 1, 'line_total' => 900]);

    $response = $this->actingAs($admin)->get('/admin/reports?sort=units');

    $response->assertInertia(fn ($page) => $page
        ->where('bestSellers.0.name', 'Roller Blind')
        ->where('bestSellers.0.units_sold', 5));

    $response = $this->actingAs($admin)->get('/admin/reports?sort=revenue');

    $response->assertInertia(fn ($page) => $page
        ->where('bestSellers.0.name', 'Roman Blind')
        ->where('bestSellers.0.revenue', fn ($value) => (float) $value === 900.0));
});

test('cancelled order items are excluded from best sellers', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->create(['status' => OrderStatus::Cancelled]);
    OrderItem::factory()->for($order)->for($product)->create();

    $response = $this->actingAs($admin)->get('/admin/reports');

    $response->assertInertia(fn ($page) => $page->where('bestSellers', []));
});

test('returning customers are those with more than one order', function () {
    $admin = User::factory()->admin()->create();
    $loyal = User::factory()->create();
    $oneTime = User::factory()->create();
    Order::factory()->count(2)->create(['user_id' => $loyal->id]);
    Order::factory()->create(['user_id' => $oneTime->id]);

    $response = $this->actingAs($admin)->get('/admin/reports');

    $response->assertInertia(fn ($page) => $page->where('customers.returning', 1));
});
