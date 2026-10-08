<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

test('customers cannot access admin product management', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/products');

    $response->assertForbidden();
});

test('admins can view the product list', function () {
    $admin = User::factory()->admin()->create();
    Product::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/admin/products');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('admin/products/index')->has('products.data', 3));
});

test('admins can search products by name', function () {
    $admin = User::factory()->admin()->create();
    $match = Product::factory()->create(['name' => 'Classic Roller Blind']);
    Product::factory()->create(['name' => 'Zebra Shade']);

    $response = $this->actingAs($admin)->get('/admin/products?search=Roller');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/products/index')
        ->has('products.data', 1)
        ->where('products.data.0.id', $match->id)
    );
});

test('admins can sort products by price', function () {
    $admin = User::factory()->admin()->create();
    $cheap = Product::factory()->create(['base_price' => 10]);
    $expensive = Product::factory()->create(['base_price' => 500]);

    $response = $this->actingAs($admin)->get('/admin/products?sort=price&direction=desc');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/products/index')
        ->where('products.data.0.id', $expensive->id)
        ->where('products.data.1.id', $cheap->id)
    );
});

test('admins can filter products by stock status', function () {
    $admin = User::factory()->admin()->create();
    $inStock = Product::factory()->create(['stock_status' => 'in_stock']);
    Product::factory()->create(['stock_status' => 'out_of_stock']);

    $response = $this->actingAs($admin)->get('/admin/products?stock_status=in_stock');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/products/index')
        ->has('products.data', 1)
        ->where('products.data.0.id', $inStock->id)
    );
});

test('admins can filter products by active status', function () {
    $admin = User::factory()->admin()->create();
    $active = Product::factory()->create(['is_active' => true]);
    Product::factory()->create(['is_active' => false]);

    $response = $this->actingAs($admin)->get('/admin/products?status=active');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/products/index')
        ->has('products.data', 1)
        ->where('products.data.0.id', $active->id)
    );
});

test('admins can view a product detail page', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($admin)->get("/admin/products/{$product->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/products/show')
        ->where('product.id', $product->id)
    );
});

test('customers cannot view a product detail page', function () {
    $customer = User::factory()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($customer)->get("/admin/products/{$product->id}");

    $response->assertForbidden();
});

test('admins can create a product with option groups', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->post('/admin/products', [
        'category_id' => $category->id,
        'name' => 'Classic Roller',
        'description' => 'A classic roller blind.',
        'price_per_sqm' => 80,
        'base_price' => 15,
        'min_width_cm' => 30,
        'max_width_cm' => 300,
        'min_height_cm' => 30,
        'max_height_cm' => 300,
        'measurement_unit_default' => 'cm',
        'is_active' => true,
        'stock_units' => 10,
        'option_groups' => [
            [
                'name' => 'Color',
                'kind' => 'color',
                'selection_type' => 'single',
                'is_required' => true,
                'values' => [
                    ['label' => 'White', 'price_modifier' => 0, 'is_default' => true],
                    ['label' => 'Charcoal', 'price_modifier' => 5, 'is_default' => false],
                ],
            ],
        ],
    ]);

    $product = Product::query()->where('name', 'Classic Roller')->firstOrFail();
    $response->assertRedirect(route('admin.products.index'));

    expect($product->optionGroups)->toHaveCount(1);
    expect($product->optionGroups->first()->values)->toHaveCount(2);
});

test('updating a product preserves existing option value ids', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();
    $group = $product->optionGroups()->create(['name' => 'Color', 'kind' => 'color', 'selection_type' => 'single', 'is_required' => true, 'sort_order' => 0]);
    $value = $group->values()->create(['label' => 'White', 'price_modifier' => 0, 'is_default' => true, 'sort_order' => 0]);

    $response = $this->actingAs($admin)->put("/admin/products/{$product->id}", [
        'category_id' => $product->category_id,
        'name' => $product->name,
        'description' => $product->description,
        'price_per_sqm' => $product->price_per_sqm,
        'base_price' => $product->base_price,
        'min_width_cm' => $product->min_width_cm,
        'max_width_cm' => $product->max_width_cm,
        'min_height_cm' => $product->min_height_cm,
        'max_height_cm' => $product->max_height_cm,
        'measurement_unit_default' => 'cm',
        'is_active' => true,
        'stock_units' => 10,
        'option_groups' => [
            [
                'id' => $group->id,
                'name' => 'Color',
                'kind' => 'color',
                'selection_type' => 'single',
                'is_required' => true,
                'values' => [
                    ['id' => $value->id, 'label' => 'Bright White', 'price_modifier' => 0, 'is_default' => true],
                ],
            ],
        ],
    ]);

    $response->assertRedirect(route('admin.products.index'));
    expect($value->fresh()->label)->toBe('Bright White');
    expect($value->fresh()->id)->toBe($value->id);
});

test('admins can create a product with fabric and mount-type option groups', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->post('/admin/products', [
        'category_id' => $category->id,
        'name' => 'Premium Zebra',
        'description' => 'A premium zebra blind.',
        'price_per_sqm' => 0,
        'base_price' => 15,
        'min_width_cm' => 30,
        'max_width_cm' => 300,
        'min_height_cm' => 30,
        'max_height_cm' => 300,
        'measurement_unit_default' => 'cm',
        'is_active' => true,
        'stock_units' => 10,
        'option_groups' => [
            [
                'name' => 'Fabric',
                'kind' => 'fabric',
                'selection_type' => 'single',
                'is_required' => true,
                'values' => [
                    ['label' => 'Cotton', 'price_modifier' => 0, 'price_per_sqm' => 40, 'is_default' => true],
                ],
            ],
            [
                'name' => 'Mount Type',
                'kind' => 'mount_type',
                'selection_type' => 'single',
                'is_required' => true,
                'values' => [
                    [
                        'label' => 'Inside Mount',
                        'price_modifier' => 0,
                        'instructions' => 'Measure the inside width of the window frame.',
                        'is_default' => true,
                    ],
                ],
            ],
        ],
    ]);

    $product = Product::query()->where('name', 'Premium Zebra')->firstOrFail();
    $response->assertRedirect(route('admin.products.index'));

    $fabricGroup = $product->optionGroups()->where('kind', 'fabric')->firstOrFail();
    $mountGroup = $product->optionGroups()->where('kind', 'mount_type')->firstOrFail();

    expect((float) $fabricGroup->values->first()->price_per_sqm)->toBe(40.0);
    expect($mountGroup->values->first()->instructions)->toBe('Measure the inside width of the window frame.');
});

test('admins can delete a product', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/products/{$product->id}");

    $response->assertRedirect(route('admin.products.index'));
    $this->assertSoftDeleted('products', ['id' => $product->id]);
});

test('a deleted product no longer appears in the product list', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();

    $this->actingAs($admin)->delete("/admin/products/{$product->id}");

    $response = $this->actingAs($admin)->get('/admin/products');

    $response->assertInertia(fn ($page) => $page
        ->component('admin/products/index')
        ->has('products.data', 0)
    );
});

test('deleting a product returns the admin to the page they were on', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();

    $this->actingAs($admin)
        ->from('/admin/products?page=3')
        ->delete("/admin/products/{$product->id}")
        ->assertRedirect('/admin/products?page=3');
});

test('an out of range page falls back to the last page', function () {
    $admin = User::factory()->admin()->create();
    Product::factory()->count(16)->create();

    $this->actingAs($admin)->get('/admin/products?page=3')
        ->assertRedirect(route('admin.products.index', ['page' => 2]));
});

test('stock units of zero mark a product out of stock', function () {
    $product = Product::factory()->create(['stock_units' => 5]);
    expect($product->fresh()->stock_status->value)->toBe('in_stock');

    $product->update(['stock_units' => 0]);
    expect($product->fresh()->stock_status->value)->toBe('out_of_stock');

    $product->update(['stock_units' => 3]);
    expect($product->fresh()->stock_status->value)->toBe('in_stock');
});
