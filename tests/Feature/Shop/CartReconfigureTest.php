<?php

use App\Models\Cart;
use App\Models\Product;

test('a customer can reconfigure an existing cart item', function () {
    $product = Product::factory()->create([
        'base_price' => 10,
        'price_per_sqm' => 0,
        'min_width_cm' => 50,
        'max_width_cm' => 200,
        'min_height_cm' => 50,
        'max_height_cm' => 200,
    ]);

    $this->post('/cart', [
        'product_id' => $product->id,
        'width' => 100,
        'height' => 100,
        'unit' => 'cm',
        'quantity' => 1,
    ]);

    $cart = Cart::query()->whereNotNull('cart_token')->firstOrFail();
    $item = $cart->items()->firstOrFail();

    $response = $this->withCookie('cart_token', $cart->cart_token)->put("/cart/{$item->id}/reconfigure", [
        'width' => 150,
        'height' => 150,
        'unit' => 'cm',
        'quantity' => 3,
    ]);

    $response->assertRedirect(route('cart.index'));

    $item->refresh();
    expect($item->width_cm)->toBe(150);
    expect($item->height_cm)->toBe(150);
    expect($item->quantity)->toBe(3);
});

test('reconfiguring a cart item requires it to belong to the current cart', function () {
    $ownerCart = Cart::factory()->guest()->create();
    $otherCart = Cart::factory()->guest()->create();
    $product = Product::factory()->create();
    $item = $ownerCart->items()->create([
        'product_id' => $product->id,
        'width_cm' => 100,
        'height_cm' => 100,
        'quantity' => 1,
        'unit_price' => 50,
        'line_total' => 50,
    ]);

    $response = $this->withCookie('cart_token', $otherCart->cart_token)->put("/cart/{$item->id}/reconfigure", [
        'width' => 120,
        'height' => 120,
        'unit' => 'cm',
        'quantity' => 1,
    ]);

    $response->assertForbidden();
});
