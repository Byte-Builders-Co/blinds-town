<?php

namespace Database\Factories;

use App\Models\Accessory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Accessory>
 */
class AccessoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst($this->faker->unique()->word()).' Bracket',
            'sku' => strtoupper($this->faker->unique()->bothify('ACC-####')),
            'stock' => 100,
            'reserved_quantity' => 0,
            'minimum_stock' => 10,
            'price' => $this->faker->randomFloat(2, 2, 50),
            'is_active' => true,
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn () => ['stock' => 5, 'minimum_stock' => 10]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
