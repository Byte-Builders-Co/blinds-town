<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SettingsController;
use Illuminate\Support\Facades\Route;

/*
 * The admin panel is scoped to exactly 9 modules: Dashboard, Product
 * Management, Category Management, Order Management, Customer Management,
 * Offer & Discount Management (the Coupon backend, relabeled), Product
 * Reviews, Reports, and System Settings. Nothing else is exposed here.
 */
Route::middleware(['auth', 'verified', 'role:admin|staff|super-admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', CategoryController::class)->except('show')
        ->middlewareFor('index', 'can:categories.view')
        ->middlewareFor(['create', 'store'], 'can:categories.create')
        ->middlewareFor(['edit', 'update'], 'can:categories.edit')
        ->middlewareFor('destroy', 'can:categories.delete');

    Route::resource('products', ProductController::class);

    // Offer & Discount Management (reuses the existing Coupon backend as-is).
    Route::resource('coupons', CouponController::class)->except('show')
        ->middlewareFor('index', 'can:coupons.view')
        ->middlewareFor(['create', 'store', 'edit', 'update', 'destroy'], 'can:coupons.manage');
    Route::patch('coupons/{coupon}/toggle', [CouponController::class, 'toggleStatus'])
        ->name('coupons.toggle')
        ->middleware('can:coupons.manage');

    Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index')->middleware('can:reviews.view');
    Route::patch('reviews/{review}/status', [ReviewController::class, 'updateStatus'])->name('reviews.update-status')->middleware('can:reviews.moderate');
    Route::delete('reviews/{review}/images/{index}', [ReviewController::class, 'removeImage'])->name('reviews.remove-image')->middleware('can:reviews.moderate');
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy')->middleware('can:reviews.moderate');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index')->middleware('can:reports.view');

    Route::get('settings/{group}', [SettingsController::class, 'edit'])->name('settings.edit')->middleware('can:settings.view');
    Route::put('settings/{group}', [SettingsController::class, 'update'])->name('settings.update')->middleware('can:settings.manage');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::patch('orders/{order}/tracking', [OrderController::class, 'updateTracking'])->name('orders.update-tracking');
    Route::post('orders/{order}/refund', [OrderController::class, 'refund'])->name('orders.refund');

    Route::middleware('can:users.view')->group(function () {
        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    });
    Route::patch('customers/{customer}/status', [CustomerController::class, 'updateStatus'])
        ->name('customers.update-status')
        ->middleware('can:users.edit');
});
