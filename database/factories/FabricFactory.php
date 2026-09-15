<?php

namespace Database\Factories;

use App\Models\Fabric;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Fabric>
 */
class FabricFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst($this->faker->unique()->word()).' Fabric',
            'sku' => strtoupper($this->faker->unique()->bothify('FAB-####')),
            'color' => $this->faker->safeColorName(),
            'unit_id' => Unit::factory(),
            'available_quantity' => 100,
            'reserved_quantity' => 0,
            'minimum_stock' => 10,
            'is_active' => true,
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn () => ['available_quantity' => 5, 'minimum_stock' => 10]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
