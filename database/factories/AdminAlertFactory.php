<?php

namespace Database\Factories;

use App\Enums\AdminAlertType;
use App\Models\AdminAlert;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AdminAlert>
 */
class AdminAlertFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => AdminAlertType::SystemError,
            'title' => $this->faker->sentence(3),
            'message' => $this->faker->sentence(10),
            'link' => null,
            'read_at' => null,
        ];
    }

    public function read(): static
    {
        return $this->state(fn () => ['read_at' => now()]);
    }
}
