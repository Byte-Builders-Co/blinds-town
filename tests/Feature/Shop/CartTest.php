<?php

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductOptionGroup;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('a guest can add an item to their cart', function () {
    $product = Product::factory()->create([
        'min_width_cm' => 50,
        'max_width_cm' => 200,
        'min_height_cm' => 50,
        'max_height_cm' => 200,
    ]);

    $response = $this->post('/cart', [
        'product_id' => $product->id,
        'width' => 100,
        'height' => 100,
        'unit' => 'cm',
        'quantity' => 2,
    ]);

    $response->assertRedirect(route('cart.index'));
    expect(Cart::query()->whereNotNull('cart_token')->first()->items()->count())->toBe(1);
});

test('an authenticated customer can add an item to their cart', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($user)->post('/cart', [
        'product_id' => $product->id,
        'width' => $product->min_width_cm,
        'height' => $product->min_height_cm,
        'unit' => 'cm',
        'quantity' => 1,
    ]);

    $response->assertRedirect(route('cart.index'));

    $cart = Cart::query()->where('user_id', $user->id)->firstOrFail();
    expect($cart->items()->count())->toBe(1);
});

test('a guest cart merges into the user cart on login', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $this->post('/cart', [
        'product_id' => $product->id,
        'width' => $product->min_width_cm,
        'height' => $product->min_height_cm,
        'unit' => 'cm',
        'quantity' => 1,
    ]);

    $guestCart = Cart::query()->whereNotNull('cart_token')->firstOrFail();
    $cookieName = 'cart_token';

    $response = $this->withCookie($cookieName, $guestCart->cart_token)
        ->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

    $response->assertRedirect(route('home'));

    $userCart = Cart::query()->where('user_id', $user->id)->firstOrFail();
    expect($userCart->items()->count())->toBe(1);
    expect(Cart::query()->find($guestCart->id))->toBeNull();
});

test('a multi-select group accepts more than one value while a single-select group rejects it', function () {
    $product = Product::factory()->create();
    $multiGroup = ProductOptionGroup::factory()->multiSelect()->for($product)->create(['is_required' => false]);
    $multiValues = $multiGroup->values()->createMany([
        ['label' => 'A', 'price_modifier' => 1, 'sort_order' => 0],
        ['label' => 'B', 'price_modifier' => 2, 'sort_order' => 1],
    ]);

    $response = $this->post('/cart', [
        'product_id' => $product->id,
        'width' => $product->min_width_cm,
        'height' => $product->min_height_cm,
        'unit' => 'cm',
        'quantity' => 1,
        'option_value_ids' => $multiValues->pluck('id')->all(),
    ]);

    $response->assertRedirect(route('cart.index'));

    $singleGroup = ProductOptionGroup::factory()->for($product)->create(['is_required' => false]);
    $singleValues = $singleGroup->values()->createMany([
        ['label' => 'X', 'price_modifier' => 1, 'sort_order' => 0],
        ['label' => 'Y', 'price_modifier' => 2, 'sort_order' => 1],
    ]);

    $rejected = $this->post('/cart', [
        'product_id' => $product->id,
        'width' => $product->min_width_cm,
        'height' => $product->min_height_cm,
        'unit' => 'cm',
        'quantity' => 1,
        'option_value_ids' => $singleValues->pluck('id')->all(),
    ]);

    $rejected->assertSessionHasErrors(['option_value_ids']);
});

test('adding to cart stores the price breakdown and an uploaded measurement photo', function () {
    Storage::fake('public');

    $product = Product::factory()->create(['base_price' => 10, 'price_per_sqm' => 0]);

    $response = $this->post('/cart', [
        'product_id' => $product->id,
        'width' => $product->min_width_cm,
        'height' => $product->min_height_cm,
        'unit' => 'cm',
        'quantity' => 1,
        'measurement_photo' => UploadedFile::fake()->image('window.jpg'),
    ]);

    $response->assertRedirect(route('cart.index'));

    $item = Cart::query()->whereNotNull('cart_token')->firstOrFail()->items()->firstOrFail();

    expect($item->price_breakdown)->not->toBeNull();
    expect((float) $item->price_breakdown['final_price'])->toBe(10.0);
    expect($item->measurement_photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($item->measurement_photo_path);
});

test('removing a cart item requires it to belong to the current cart', function () {
    $ownerCart = Cart::factory()->guest()->create();
    $otherCart = Cart::factory()->guest()->create();
    $item = $ownerCart->items()->create([
        'product_id' => Product::factory()->create()->id,
        'width_cm' => 100,
        'height_cm' => 100,
        'quantity' => 1,
        'unit_price' => 50,
        'line_total' => 50,
    ]);

    $response = $this->withCookie('cart_token', $otherCart->cart_token)
        ->delete("/cart/{$item->id}");

    $response->assertForbidden();
});
