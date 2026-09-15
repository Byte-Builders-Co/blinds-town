<?php

namespace Database\Factories;

use App\Enums\PricingTierType;
use App\Models\Product;
use App\Models\ProductPricingTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductPricingTier>
 */
class ProductPricingTierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'min_area_sqm' => 0,
            'max_area_sqm' => null,
            'pricing_type' => PricingTierType::PerSqm,
            'price' => $this->faker->randomFloat(2, 500, 2000),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
