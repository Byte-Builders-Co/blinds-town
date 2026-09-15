<?php

use App\Enums\MeasurementUnit;
use App\Models\Product;
use App\Models\ProductOptionGroup;
use App\Models\ProductOptionValue;
use App\Models\Setting;
use App\Services\BlindPricingService;

test('unit price combines base price, area, and option modifiers', function () {
    $product = Product::factory()->create([
        'base_price' => 20,
        'price_per_sqm' => 100,
    ]);

    $group = ProductOptionGroup::factory()->for($product)->create();
    $value = ProductOptionValue::factory()->for($group, 'optionGroup')->create([
        'price_modifier' => 15,
    ]);

    // 1m x 1m = 1 sqm, so price_per_sqm applies fully.
    $breakdown = app(BlindPricingService::class)->calculate($product, 100, 100, MeasurementUnit::Cm, [$value->id]);

    expect($breakdown['final_price'])->toBe(20 + 100 + 15.0);
});

test('unit price ignores option values that do not belong to the product', function () {
    $product = Product::factory()->create([
        'base_price' => 10,
        'price_per_sqm' => 0,
    ]);

    $otherProduct = Product::factory()->create();
    $foreignGroup = ProductOptionGroup::factory()->for($otherProduct)->create();
    $foreignValue = ProductOptionValue::factory()->for($foreignGroup, 'optionGroup')->create([
        'price_modifier' => 999,
    ]);

    $breakdown = app(BlindPricingService::class)->calculate($product, 100, 100, MeasurementUnit::Cm, [$foreignValue->id]);

    expect($breakdown['final_price'])->toBe(10.0);
});

test('minimum billable area floor is applied', function () {
    $product = Product::factory()->create([
        'base_price' => 0,
        'price_per_sqm' => 0,
        'min_area_sqm' => 5,
    ]);

    $group = ProductOptionGroup::factory()->fabric()->for($product)->create();
    $value = ProductOptionValue::factory()->for($group, 'optionGroup')->create([
        'price_modifier' => 0,
        'price_per_sqm' => 10,
    ]);

    // 1m x 1m = 1 sqm actual, but floor is 5 sqm.
    $breakdown = app(BlindPricingService::class)->calculate($product, 100, 100, MeasurementUnit::Cm, [$value->id]);

    expect($breakdown['billable_area_sqm'])->toBe(5.0);
    expect($breakdown['fabric_cost'])->toBe(50.0);
});

test('inch measurements are normalized to the same price as their cm equivalent', function () {
    $product = Product::factory()->create([
        'base_price' => 20,
        'price_per_sqm' => 100,
        'min_width_cm' => 10,
        'max_width_cm' => 500,
        'min_height_cm' => 10,
        'max_height_cm' => 500,
    ]);

    $service = app(BlindPricingService::class);
    $cmBreakdown = $service->calculate($product, 100, 100, MeasurementUnit::Cm);
    $inchBreakdown = $service->calculate($product, 100 / 2.54, 100 / 2.54, MeasurementUnit::Inch);

    expect(round($inchBreakdown['final_price'], 2))->toBe(round($cmBreakdown['final_price'], 2));
});

test('tax is applied on top of the subtotal', function () {
    Setting::set('tax.gst_rate', 10);

    $product = Product::factory()->create([
        'base_price' => 100,
        'price_per_sqm' => 0,
    ]);

    $breakdown = app(BlindPricingService::class)->calculate($product, $product->min_width_cm, $product->min_height_cm, MeasurementUnit::Cm);

    expect($breakdown['tax_amount'])->toBe(10.0);
    expect($breakdown['final_price'])->toBe(110.0);
});

test('product-level discount is applied before tax', function () {
    Setting::set('tax.gst_rate', 10);

    $product = Product::factory()->create([
        'base_price' => 100,
        'price_per_sqm' => 0,
        'discount_percent' => 20,
    ]);

    $breakdown = app(BlindPricingService::class)->calculate($product, $product->min_width_cm, $product->min_height_cm, MeasurementUnit::Cm);

    expect($breakdown['product_discount'])->toBe(20.0);
    expect($breakdown['taxable_amount'])->toBe(80.0);
    expect($breakdown['tax_amount'])->toBe(8.0);
    expect($breakdown['final_price'])->toBe(88.0);
});

test('disabling GST zeroes tax even when a product has its own tax rate', function () {
    Setting::set('tax.gst_enabled', false);

    $product = Product::factory()->create([
        'base_price' => 100,
        'price_per_sqm' => 0,
        'tax_rate_percent' => 15,
    ]);

    $breakdown = app(BlindPricingService::class)->calculate($product, $product->min_width_cm, $product->min_height_cm, MeasurementUnit::Cm);

    expect($breakdown['tax_amount'])->toBe(0.0);
    expect($breakdown['final_price'])->toBe(100.0);
});

test('adding to cart with out-of-range dimensions is rejected', function () {
    $product = Product::factory()->create([
        'min_width_cm' => 50,
        'max_width_cm' => 200,
        'min_height_cm' => 50,
        'max_height_cm' => 200,
    ]);

    $response = $this->post('/cart', [
        'product_id' => $product->id,
        'width' => 20,
        'height' => 60,
        'unit' => 'cm',
        'quantity' => 1,
    ]);

    $response->assertSessionHasErrors(['width']);
});

test('adding to cart without a required option is rejected', function () {
    $product = Product::factory()->create();
    $group = ProductOptionGroup::factory()->for($product)->create(['is_required' => true]);
    ProductOptionValue::factory()->for($group, 'optionGroup')->create();

    $response = $this->post('/cart', [
        'product_id' => $product->id,
        'width' => $product->min_width_cm,
        'height' => $product->min_height_cm,
        'unit' => 'cm',
        'quantity' => 1,
    ]);

    $response->assertSessionHasErrors(['option_value_ids']);
});
