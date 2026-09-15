<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 50, 500);

        return [
            'user_id' => User::factory(),
            'order_number' => Order::generateOrderNumber(),
            'status' => OrderStatus::Pending,
            'subtotal' => $subtotal,
            'discount_amount' => 0,
            'coupon_code' => null,
            'tax_amount' => 0,
            'shipping_charge' => 0,
            'installation_requested' => false,
            'installation_charge' => 0,
            'total' => $subtotal,
            'currency' => 'usd',
            'shipping_name' => $this->faker->name(),
            'shipping_line1' => $this->faker->streetAddress(),
            'shipping_line2' => null,
            'shipping_city' => $this->faker->city(),
            'shipping_postal_code' => $this->faker->postcode(),
            'shipping_country' => $this->faker->countryCode(),
            'shipping_phone' => $this->faker->phoneNumber(),
            'carrier' => null,
            'tracking_number' => null,
            'shipped_at' => null,
            'delivered_at' => null,
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Confirmed]);
    }
}
