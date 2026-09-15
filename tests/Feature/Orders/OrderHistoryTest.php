<?php

use App\Models\Order;
use App\Models\User;

test('a customer only sees their own orders in the index', function () {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();

    Order::factory()->for($customer)->create();
    Order::factory()->for($otherCustomer)->create();

    $response = $this->actingAs($customer)->get('/orders');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('orders/index')->has('orders.data', 1));
});

test('a customer cannot view another customers order', function () {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();
    $order = Order::factory()->for($otherCustomer)->create();

    $response = $this->actingAs($customer)->get("/orders/{$order->order_number}");

    $response->assertForbidden();
});

test('admins use the admin order route instead of the customer order route', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $order = Order::factory()->for($customer)->create();

    $response = $this->actingAs($admin)->get("/orders/{$order->order_number}");
    $response->assertForbidden();

    $response = $this->actingAs($admin)->get("/admin/orders/{$order->id}");
    $response->assertOk();
});
