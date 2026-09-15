<?php

use App\Http\Controllers\Api\ProductCustomizationController;
use Illuminate\Support\Facades\Route;

Route::get('products/{product}/customization', [ProductCustomizationController::class, 'customization'])
    ->name('api.products.customization');

Route::post('products/{product}/calculate-price', [ProductCustomizationController::class, 'calculatePrice'])
    ->name('api.products.calculate-price');
