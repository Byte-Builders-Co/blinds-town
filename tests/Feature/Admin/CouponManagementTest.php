<?php

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

test('guests cannot access coupon management', function () {
    $response = $this->get('/admin/coupons');

    $response->assertRedirect(route('login'));
});

test('customers cannot access coupon management', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/coupons');

    $response->assertForbidden();
});

test('admins can create a percentage coupon', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/coupons', [
        'code' => 'save20',
        'type' => 'percentage',
        'value' => 20,
        'max_discount' => 50,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('admin.coupons.index'));
    $this->assertDatabaseHas('coupons', [
        'code' => 'SAVE20',
        'type' => 'percentage',
        'value' => 20,
        'max_discount' => 50,
    ]);
});

test('a percentage coupon cannot exceed 100', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/coupons', [
        'code' => 'TOOBIG',
        'type' => 'percentage',
        'value' => 150,
        'is_active' => true,
    ]);

    $response->assertSessionHasErrors('value');
});

test('admins can restrict a coupon to specific products and categories', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->post('/admin/coupons', [
        'code' => 'BLINDS10',
        'type' => 'fixed',
        'value' => 10,
        'is_active' => true,
        'product_ids' => [$product->id],
        'category_ids' => [$category->id],
    ]);

    $response->assertRedirect(route('admin.coupons.index'));
    $coupon = Coupon::query()->where('code', 'BLINDS10')->firstOrFail();
    expect($coupon->products->pluck('id')->all())->toBe([$product->id]);
    expect($coupon->categories->pluck('id')->all())->toBe([$category->id]);
});

test('admins can update a coupon', function () {
    $admin = User::factory()->admin()->create();
    $coupon = Coupon::factory()->create(['code' => 'OLDCODE', 'value' => 5]);

    $response = $this->actingAs($admin)->put("/admin/coupons/{$coupon->id}", [
        'code' => 'newcode',
        'type' => 'percentage',
        'value' => 15,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('admin.coupons.edit', $coupon));
    $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'code' => 'NEWCODE', 'value' => 15]);
});

test('admins can toggle a coupon active status', function () {
    $admin = User::factory()->admin()->create();
    $coupon = Coupon::factory()->create(['is_active' => true]);

    $response = $this->actingAs($admin)->patch("/admin/coupons/{$coupon->id}/toggle");

    $response->assertRedirect();
    expect($coupon->fresh()->is_active)->toBeFalse();
});

test('admins cannot delete a coupon that has usage history', function () {
    $admin = User::factory()->admin()->create();
    $coupon = Coupon::factory()->create();
    $order = Order::factory()->create(['user_id' => $admin->id]);
    $coupon->usages()->create(['user_id' => $admin->id, 'order_id' => $order->id, 'discount_amount' => 5]);

    $response = $this->actingAs($admin)->delete("/admin/coupons/{$coupon->id}");

    $response->assertSessionHasErrors('coupon');
    $this->assertDatabaseHas('coupons', ['id' => $coupon->id]);
});

test('admins can delete an unused coupon', function () {
    $admin = User::factory()->admin()->create();
    $coupon = Coupon::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/coupons/{$coupon->id}");

    $response->assertRedirect(route('admin.coupons.index'));
    $this->assertDatabaseMissing('coupons', ['id' => $coupon->id]);
});
