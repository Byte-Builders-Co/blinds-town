<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;

function reviewPayload(array $overrides = []): array
{
    return array_merge([
        'rating' => 5,
        'title' => 'Great blinds',
        'comment' => 'Very happy with the quality and fit.',
    ], $overrides);
}

test('a customer who purchased the product can submit a review', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->for($user)->confirmed()->create();
    OrderItem::factory()->for($order)->for($product)->create();

    $response = $this->actingAs($user)->post("/products/{$product->id}/reviews", reviewPayload());

    $response->assertRedirect();
    $this->assertDatabaseHas('product_reviews', [
        'user_id' => $user->id,
        'product_id' => $product->id,
        'rating' => 5,
    ]);
});

test('a customer who has not purchased the product cannot submit a review', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($user)->post("/products/{$product->id}/reviews", reviewPayload());

    $response->assertForbidden();
    $this->assertDatabaseMissing('product_reviews', [
        'user_id' => $user->id,
        'product_id' => $product->id,
    ]);
});

test('a customer cannot submit more than one review for the same product', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->for($user)->confirmed()->create();
    OrderItem::factory()->for($order)->for($product)->create();
    ProductReview::factory()->for($user)->for($product)->create();

    $response = $this->actingAs($user)->post("/products/{$product->id}/reviews", reviewPayload());

    $response->assertForbidden();
    expect(ProductReview::query()->where('user_id', $user->id)->where('product_id', $product->id)->count())->toBe(1);
});

test('guests cannot submit reviews', function () {
    $product = Product::factory()->create();

    $response = $this->post("/products/{$product->id}/reviews", reviewPayload());

    $response->assertRedirect(route('login'));
});

test('review requires a valid rating between 1 and 5', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->for($user)->confirmed()->create();
    OrderItem::factory()->for($order)->for($product)->create();

    $response = $this->actingAs($user)->post("/products/{$product->id}/reviews", reviewPayload(['rating' => 6]));

    $response->assertSessionHasErrors(['rating']);
});
