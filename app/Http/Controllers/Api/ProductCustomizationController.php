<?php

namespace App\Http\Controllers\Api;

use App\Enums\MeasurementUnit;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductQuoteRequest;
use App\Models\Product;
use App\Services\BlindPricingService;
use Illuminate\Http\JsonResponse;

class ProductCustomizationController extends Controller
{
    public function __construct(
        private readonly BlindPricingService $pricing,
    ) {}

    /**
     * Everything a client needs to render the customization form for a
     * product: base price, measurement bounds, active option groups/values
     * (with their compatibility metadata so incompatible combinations can
     * be pre-filtered client-side), and any area-based pricing tiers.
     */
    public function customization(Product $product): JsonResponse
    {
        $product->load([
            'category:id,name,slug',
            'optionGroups' => fn ($query) => $query->where('is_active', true),
            'optionGroups.values' => fn ($query) => $query->where('is_active', true),
            'pricingTiers' => fn ($query) => $query->where('is_active', true),
        ]);

        return response()->json([
            'product' => [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'category' => $product->category,
                'base_price' => (float) $product->base_price,
                'price_per_sqm' => (float) $product->price_per_sqm,
                'min_area_sqm' => $product->min_area_sqm !== null ? (float) $product->min_area_sqm : null,
                'min_width_cm' => $product->min_width_cm,
                'max_width_cm' => $product->max_width_cm,
                'min_height_cm' => $product->min_height_cm,
                'max_height_cm' => $product->max_height_cm,
                'measurement_unit_default' => $product->measurement_unit_default,
                'image_path' => $product->image_path,
                'gallery' => $product->gallery,
            ],
            'option_groups' => $product->optionGroups,
            'pricing_tiers' => $product->pricingTiers,
        ]);
    }

    /**
     * Server-authoritative price calculation for a given configuration.
     * Never trusts a client-supplied price — always recalculates from the
     * product's live base price, option prices, and pricing tiers via the
     * same BlindPricingService used by the storefront cart.
     */
    public function calculatePrice(ProductQuoteRequest $request, Product $product): JsonResponse
    {
        $breakdown = $this->pricing->calculate(
            $product,
            (float) $request->validated('width'),
            (float) $request->validated('height'),
            MeasurementUnit::from($request->validated('unit')),
            $request->validated('option_value_ids', []),
        );

        return response()->json([
            'base_price' => $breakdown['base_price'],
            'customization_total' => $breakdown['customization_total'],
            'discount' => $breakdown['discount'],
            'gst' => $breakdown['gst'],
            'final_price' => $breakdown['final_price'],
            'breakdown' => $breakdown['breakdown'],
        ]);
    }
}
