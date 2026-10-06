<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Customer\AccountController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('products', [ProductController::class, 'index'])->name('products.index');
Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('categories/{category:slug}', [CategoryController::class, 'show'])->name('categories.show');
Route::get('products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('products/{product:slug}/quote', [ProductController::class, 'quote'])->name('products.quote');
Route::get('products/{product}/reviews', [ProductReviewController::class, 'index'])->name('products.reviews.index');

Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::post('cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
Route::put('cart/{cartItem}/reconfigure', [CartController::class, 'reconfigure'])->name('cart.reconfigure');
Route::delete('cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('products/{product}/reviews', [ProductReviewController::class, 'store'])->name('products.reviews.store');

    Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('wishlist/{product}', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('wishlist/{product}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
});

Route::middleware('checkout.access')->group(function () {
    Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::get('checkout/quote', [CheckoutController::class, 'quote'])->name('checkout.quote');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('checkout/{order}/pay', [CheckoutController::class, 'pay'])->name('checkout.pay');
    Route::get('checkout/{order}/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('checkout/{order}/cancel', [CheckoutController::class, 'cancel'])->name('checkout.cancel');
    Route::post('checkout/{order}/retry', [CheckoutController::class, 'retryPayment'])->name('checkout.retry');
});

Route::get('orders/{order:order_number}/track', [OrderController::class, 'track'])
    ->middleware('signed')
    ->name('orders.track');

Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    Route::get('account', [AccountController::class, 'index'])->name('account.index');

    Route::get('account/addresses', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('account/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::put('account/addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('account/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::patch('account/addresses/{address}/default', [AddressController::class, 'setDefault'])->name('addresses.set-default');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order:order_number}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('orders/{order:order_number}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
});

Route::post('stripe/webhook', [StripeWebhookController::class, 'handle'])->name('stripe.webhook');
