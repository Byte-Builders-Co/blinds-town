<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
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
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'product_name' => $this->faker->words(3, true),
            'width_cm' => $width,
            'height_cm' => $height,
            'quantity' => 1,
            'selected_options' => [],
            'unit_price' => $unitPrice,
            'line_total' => $unitPrice,
        ];
    }
}
