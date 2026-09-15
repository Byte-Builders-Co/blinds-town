<?php

use App\Models\Category;
use App\Models\Product;

test('home page lists active categories and featured products', function () {
    $category = Category::factory()->create(['is_active' => true]);
    Product::factory()->for($category)->create(['is_active' => true, 'is_featured' => true]);
    Product::factory()->for($category)->create(['is_active' => true, 'is_featured' => false]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('welcome')
        ->has('categories', 1)
        ->has('featuredProducts', 1)
    );
});

test('categories index page lists only active top-level categories', function () {
    $parent = Category::factory()->create(['is_active' => true]);
    Category::factory()->for($parent, 'parent')->create(['is_active' => true]);
    Category::factory()->create(['is_active' => false]);

    $response = $this->get('/categories');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/categories')
        ->has('categories', 1)
        ->where('categories.0.id', $parent->id)
    );
});

test('category page lists only active products in that category', function () {
    $category = Category::factory()->create();
    $activeProduct = Product::factory()->for($category)->create(['is_active' => true]);
    Product::factory()->for($category)->create(['is_active' => false]);

    $response = $this->get("/categories/{$category->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/category')
        ->has('products.data', 1)
        ->where('products.data.0.id', $activeProduct->id)
    );
});

test('product page shows option groups and values', function () {
    $product = Product::factory()->create();
    $group = $product->optionGroups()->create(['name' => 'Color', 'kind' => 'color', 'selection_type' => 'single', 'is_required' => true, 'sort_order' => 0]);
    $group->values()->create(['label' => 'White', 'price_modifier' => 0, 'is_default' => true, 'sort_order' => 0]);

    $response = $this->get("/products/{$product->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/product-show')
        ->has('product.option_groups', 1)
        ->has('product.option_groups.0.values', 1)
    );
});

test('price quote endpoint returns the calculated price breakdown', function () {
    $product = Product::factory()->create([
        'base_price' => 10,
        'price_per_sqm' => 50,
        'min_width_cm' => 50,
        'max_width_cm' => 200,
        'min_height_cm' => 50,
        'max_height_cm' => 200,
    ]);

    $response = $this->getJson("/products/{$product->slug}/quote?width=100&height=100&unit=cm");

    $response->assertOk();
    $response->assertJson(['final_price' => 60]);
});
