<?php

namespace Database\Factories;

use App\Enums\AdjustmentType;
use App\Models\Fabric;
use App\Models\InventoryAdjustment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryAdjustment>
 */
class InventoryAdjustmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'adjustable_type' => Fabric::class,
            'adjustable_id' => Fabric::factory(),
            'type' => AdjustmentType::Increase,
            'previous_quantity' => 100,
            'adjustment' => 20,
            'new_quantity' => 120,
            'reason' => 'New stock received',
            'adjusted_by' => User::factory(),
        ];
    }
}
