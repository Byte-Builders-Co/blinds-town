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
