<?php

namespace Database\Factories;

use App\Models\ProductOptionGroup;
use App\Models\ProductOptionValue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductOptionValue>
 */
class ProductOptionValueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_option_group_id' => ProductOptionGroup::factory(),
            'label' => ucfirst($this->faker->unique()->word()),
            'price_modifier' => $this->faker->randomFloat(2, 0, 25),
            'is_default' => false,
            'sort_order' => 0,
        ];
    }
}
