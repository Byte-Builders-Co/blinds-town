<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CartItem>
 */
class CartItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $width = $this->faker->numberBetween(60, 200);
        $height = $this->faker->numberBetween(60, 200);
        $unitPrice = $this->faker->randomFloat(2, 20, 200);

        return [
            'cart_id' => Cart::factory(),
            'product_id' => Product::factory(),
            'width_cm' => $width,
            'height_cm' => $height,
            'quantity' => 1,
            'selected_options' => [],
            'unit_price' => $unitPrice,
            'line_total' => $unitPrice,
        ];
    }
}
