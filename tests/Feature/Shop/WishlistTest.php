<?php

use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;

test('guests are redirected to login when adding to wishlist', function () {
    $product = Product::factory()->create();

    $response = $this->post("/wishlist/{$product->id}");

    $response->assertRedirect(route('login'));
});

test('an authenticated customer can add and remove a product from their wishlist', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($user)->post("/wishlist/{$product->id}")
        ->assertRedirect();

    $this->assertDatabaseHas('wishlist_items', [
        'user_id' => $user->id,
        'product_id' => $product->id,
    ]);

    $this->actingAs($user)->delete("/wishlist/{$product->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('wishlist_items', [
        'user_id' => $user->id,
        'product_id' => $product->id,
    ]);
});

test('adding the same product twice does not create duplicate wishlist entries', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($user)->post("/wishlist/{$product->id}");
    $this->actingAs($user)->post("/wishlist/{$product->id}");

    expect(WishlistItem::query()->where('user_id', $user->id)->where('product_id', $product->id)->count())->toBe(1);
});

test('wishlist index lists only the current users items', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $product = Product::factory()->create();
    $otherProduct = Product::factory()->create();

    WishlistItem::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);
    WishlistItem::factory()->create(['user_id' => $otherUser->id, 'product_id' => $otherProduct->id]);

    $response = $this->actingAs($user)->get('/wishlist');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/wishlist')
        ->has('items', 1)
        ->where('items.0.product_id', $product->id)
    );
});
