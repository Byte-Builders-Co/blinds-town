<?php

namespace Database\Factories;

use App\Enums\RefundStatus;
use App\Models\Payment;
use App\Models\Refund;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Refund>
 */
class RefundFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payment_id' => Payment::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 100),
            'reason' => $this->faker->sentence(),
            'status' => RefundStatus::Requested,
            'gateway_reference' => null,
        ];
    }
}
