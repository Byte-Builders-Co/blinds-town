<?php

use App\Models\Category;
use App\Models\Product;

test('product listing shows active products with pagination', function () {
    Product::factory()->count(15)->create(['is_active' => true]);
    Product::factory()->create(['is_active' => false]);

    $response = $this->get('/products');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/products/index')
        ->has('products.data', 12)
        ->where('products.total', 15)
    );
});

test('product listing can be filtered by search term', function () {
    Product::factory()->create(['name' => 'Blackout Roller Blind', 'is_active' => true]);
    Product::factory()->create(['name' => 'Sheer Roman Blind', 'is_active' => true]);

    $response = $this->get('/products?search=Blackout');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/products/index')
        ->has('products.data', 1)
        ->where('products.data.0.name', 'Blackout Roller Blind')
    );
});

test('product listing can be filtered by category', function () {
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();
    Product::factory()->for($categoryA)->create(['is_active' => true]);
    Product::factory()->for($categoryB)->create(['is_active' => true]);

    $response = $this->get("/products?category={$categoryA->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/products/index')
        ->has('products.data', 1)
    );
});

test('product listing can be filtered by price range', function () {
    Product::factory()->create(['base_price' => 10, 'is_active' => true]);
    Product::factory()->create(['base_price' => 100, 'is_active' => true]);

    $response = $this->get('/products?min_price=50&max_price=150');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/products/index')
        ->has('products.data', 1)
        ->where('products.data.0.base_price', '100.00')
    );
});

test('product listing can be filtered by availability', function () {
    Product::factory()->create(['stock_status' => 'in_stock', 'is_active' => true]);
    Product::factory()->create(['stock_status' => 'out_of_stock', 'is_active' => true]);

    $response = $this->get('/products?availability=out_of_stock');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/products/index')
        ->has('products.data', 1)
        ->where('products.data.0.stock_status', 'out_of_stock')
    );
});

test('product listing can be sorted by price', function () {
    Product::factory()->create(['name' => 'Cheap', 'base_price' => 10, 'is_active' => true]);
    Product::factory()->create(['name' => 'Expensive', 'base_price' => 100, 'is_active' => true]);

    $response = $this->get('/products?sort=price_high');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/products/index')
        ->where('products.data.0.name', 'Expensive')
    );
});
