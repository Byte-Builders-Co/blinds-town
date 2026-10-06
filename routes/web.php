<?php

use App\Http\Controllers\CmsPageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('about', [CmsPageController::class, 'show'])->defaults('slug', 'about')->name('cms.about');
Route::get('privacy-policy', [CmsPageController::class, 'show'])->defaults('slug', 'privacy-policy')->name('cms.privacy-policy');
Route::get('terms', [CmsPageController::class, 'show'])->defaults('slug', 'terms')->name('cms.terms');
Route::get('shipping-policy', [CmsPageController::class, 'show'])->defaults('slug', 'shipping-policy')->name('cms.shipping-policy');
Route::get('return-refund-policy', [CmsPageController::class, 'show'])->defaults('slug', 'return-refund-policy')->name('cms.return-refund-policy');
// Pages created in the admin. The five pages above keep their original URLs.
Route::get('pages/{slug}', [CmsPageController::class, 'show'])->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*')->name('cms.page');
Route::get('faq', [FaqController::class, 'index'])->name('faq');

Route::get('contact', [ContactController::class, 'show'])->name('contact.show');
Route::post('contact', [ContactController::class, 'store'])->name('contact.store');

require __DIR__.'/settings.php';
require __DIR__.'/shop.php';
require __DIR__.'/admin.php';
