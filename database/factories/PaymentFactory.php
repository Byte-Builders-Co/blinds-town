<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'method' => PaymentMethod::Online,
            'gateway' => 'stripe',
            'amount' => $this->faker->randomFloat(2, 50, 500),
            'currency' => 'usd',
            'status' => PaymentStatus::Pending,
            'gateway_session_id' => null,
            'gateway_transaction_id' => null,
            'paid_at' => null,
            'failure_reason' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'gateway_transaction_id' => 'pi_'.$this->faker->uuid(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => PaymentStatus::Failed,
            'failure_reason' => 'Your card was declined.',
        ]);
    }

    public function cod(): static
    {
        return $this->state(fn () => [
            'method' => PaymentMethod::Cod,
            'gateway' => null,
        ]);
    }
}
