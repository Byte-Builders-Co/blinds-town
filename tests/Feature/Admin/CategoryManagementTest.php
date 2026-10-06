<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

test('guests cannot access admin category management', function () {
    $response = $this->get('/admin/categories');

    $response->assertRedirect(route('login'));
});

test('customers cannot access admin category management', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/categories');

    $response->assertForbidden();
});

test('admins can create a category', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/categories', [
        'name' => 'Roller Blinds',
        'description' => 'Sleek roller blinds.',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseHas('categories', [
        'name' => 'Roller Blinds',
        'slug' => 'roller-blinds',
        'created_by' => $admin->id,
    ]);
});

test('admins can create a subcategory under a parent', function () {
    $admin = User::factory()->admin()->create();
    $parent = Category::factory()->create();

    $response = $this->actingAs($admin)->post('/admin/categories', [
        'parent_id' => $parent->id,
        'name' => 'Blackout Roller Blinds',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseHas('categories', [
        'name' => 'Blackout Roller Blinds',
        'parent_id' => $parent->id,
    ]);
});

test('admins can update a category', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['name' => 'Old Name']);

    $response = $this->actingAs($admin)->put("/admin/categories/{$category->id}", [
        'name' => 'New Name',
        'description' => 'Updated',
        'is_active' => false,
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    expect($category->fresh()->name)->toBe('New Name');
    expect($category->fresh()->is_active)->toBeFalse();
});

test('admins can delete a category', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/categories/{$category->id}");

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('deleting a category with subcategories is blocked', function () {
    $admin = User::factory()->admin()->create();
    $parent = Category::factory()->create();
    Category::factory()->create(['parent_id' => $parent->id]);

    $response = $this->actingAs($admin)->delete("/admin/categories/{$parent->id}");

    $response->assertSessionHasErrors('category');
    $this->assertDatabaseHas('categories', ['id' => $parent->id]);
});

test('deleting a category with products is blocked', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();
    Product::factory()->for($category)->create();

    $response = $this->actingAs($admin)->delete("/admin/categories/{$category->id}");

    $response->assertSessionHasErrors('category');
    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

test('staff without the categories.delete permission cannot delete a category', function () {
    $staff = User::factory()->staff()->create();
    $staff->revokePermissionTo('categories.delete');
    $category = Category::factory()->create();

    $response = $this->actingAs($staff)->delete("/admin/categories/{$category->id}");

    $response->assertForbidden();
});

test('admins can toggle a category between active and inactive', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['is_active' => true]);

    $this->actingAs($admin)->patch("/admin/categories/{$category->id}/toggle")->assertRedirect();
    expect($category->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->patch("/admin/categories/{$category->id}/toggle")->assertRedirect();
    expect($category->fresh()->is_active)->toBeTrue();
});

test('admins can duplicate a category as an inactive copy', function () {
    $admin = User::factory()->admin()->create();
    $parent = Category::factory()->create();
    $category = Category::factory()->create(['name' => 'Zebra Blinds', 'parent_id' => $parent->id]);

    $this->actingAs($admin)->post("/admin/categories/{$category->id}/duplicate")->assertRedirect();

    $copy = Category::query()->where('name', 'Zebra Blinds (Copy)')->first();

    expect($copy)->not->toBeNull()
        ->and($copy->is_active)->toBeFalse()
        ->and($copy->parent_id)->toBe($parent->id)
        ->and($copy->slug)->not->toBe($category->slug);
});

test('a category can be hidden from the storefront menu', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post('/admin/categories', [
        'name' => 'Hidden From Menu',
        'show_in_menu' => false,
        'is_active' => true,
    ])->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', ['name' => 'Hidden From Menu', 'show_in_menu' => false]);
});

test('the category list page receives every category', function () {
    $admin = User::factory()->admin()->create();
    $parent = Category::factory()->create();
    Category::factory()->count(2)->create(['parent_id' => $parent->id]);

    $this->actingAs($admin)->get('/admin/categories')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/categories/index')->has('categories', 3));
});
