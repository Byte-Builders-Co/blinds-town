<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CmsPageController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
 * The admin panel is scoped to exactly 9 modules: Dashboard, Product
 * Management, Category Management, Order Management, Customer Management,
 * Offer & Discount Management (the Coupon backend, relabeled), Product
 * Reviews, Reports, and System Settings. Nothing else is exposed here.
 */
Route::middleware(['auth', 'verified', 'role:admin|staff|super-admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard')->middleware('can:dashboard.view');

    Route::resource('categories', CategoryController::class)->except('show')
        ->middlewareFor('index', 'can:categories.view')
        ->middlewareFor(['create', 'store'], 'can:categories.create')
        ->middlewareFor(['edit', 'update'], 'can:categories.edit')
        ->middlewareFor('destroy', 'can:categories.delete');
    Route::patch('categories/{category}/toggle', [CategoryController::class, 'toggle'])->name('categories.toggle')->middleware('can:categories.edit');
    Route::post('categories/{category}/duplicate', [CategoryController::class, 'duplicate'])->name('categories.duplicate')->middleware('can:categories.create');

    Route::resource('products', ProductController::class)
        ->middlewareFor(['index', 'show'], 'can:products.view')
        ->middlewareFor(['create', 'store'], 'can:products.create')
        ->middlewareFor(['edit', 'update'], 'can:products.edit')
        ->middlewareFor('destroy', 'can:products.delete');

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

    // Content pages (Privacy, Terms, Shipping, Return & Refund) edited with the rich-text editor.
    Route::get('cms-pages', [CmsPageController::class, 'index'])->name('cms-pages.index')->middleware('can:cms.view');
    Route::get('cms-pages/create', [CmsPageController::class, 'create'])->name('cms-pages.create')->middleware('can:cms.manage');
    Route::post('cms-pages', [CmsPageController::class, 'store'])->name('cms-pages.store')->middleware('can:cms.manage');
    Route::get('cms-pages/{page:slug}/edit', [CmsPageController::class, 'edit'])->name('cms-pages.edit')->middleware('can:cms.view');
    Route::put('cms-pages/{page:slug}', [CmsPageController::class, 'update'])->name('cms-pages.update')->middleware('can:cms.manage');
    Route::delete('cms-pages/{page:slug}', [CmsPageController::class, 'destroy'])->name('cms-pages.destroy')->middleware('can:cms.manage');

    // FAQ questions and answers shown on the storefront FAQ page.
    Route::get('faqs', [FaqController::class, 'index'])->name('faqs.index')->middleware('can:cms.view');
    Route::post('faqs/categories', [FaqController::class, 'storeCategory'])->name('faqs.categories.store')->middleware('can:cms.manage');
    Route::delete('faqs/categories', [FaqController::class, 'destroyCategory'])->name('faqs.categories.destroy')->middleware('can:cms.manage');
    Route::post('faqs', [FaqController::class, 'store'])->name('faqs.store')->middleware('can:cms.manage');
    Route::put('faqs/{faq}', [FaqController::class, 'update'])->name('faqs.update')->middleware('can:cms.manage');
    Route::delete('faqs/{faq}', [FaqController::class, 'destroy'])->name('faqs.destroy')->middleware('can:cms.manage');

    Route::get('settings/{group}', [SettingsController::class, 'edit'])->name('settings.edit')->middleware('can:settings.view');
    Route::put('settings/{group}', [SettingsController::class, 'update'])->name('settings.update')->middleware('can:settings.manage');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index')->middleware('can:orders.view');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show')->middleware('can:orders.view');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status')->middleware('can:orders.update_status');
    Route::patch('orders/{order}/tracking', [OrderController::class, 'updateTracking'])->name('orders.update-tracking')->middleware('can:orders.update_status');
    Route::post('orders/{order}/refund', [OrderController::class, 'refund'])->name('orders.refund')->middleware('can:orders.refund');

    // Team and access management. Which users a person may see or change is
    // limited by rank inside the controller, on top of these permissions.
    Route::middleware('can:users.view')->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
    });
    Route::middleware('can:users.create')->group(function () {
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
    });
    Route::middleware('can:users.edit')->group(function () {
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    });
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('can:users.delete');

    // Super Admin only: the audit trail of who changed what.
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index')->middleware('can:activity_logs.view');

    Route::middleware('can:users.view')->group(function () {
        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('customers/export', [CustomerController::class, 'export'])->name('customers.export');
    });
    Route::middleware('can:users.create')->group(function () {
        Route::get('customers/create', [CustomerController::class, 'create'])->name('customers.create');
        Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    });
    Route::middleware('can:users.edit')->group(function () {
        Route::get('customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
        Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
        Route::patch('customers/{customer}/status', [CustomerController::class, 'updateStatus'])->name('customers.update-status');
    });
    Route::middleware('can:users.view')->group(function () {
        Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    });
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])
        ->name('customers.destroy')
        ->middleware('can:users.delete');
});
