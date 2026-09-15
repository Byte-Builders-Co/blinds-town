<?php

namespace Database\Factories;

use App\Models\CmsBanner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CmsBanner>
 */
class CmsBannerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'subtitle' => $this->faker->sentence(8),
            'image_path' => 'banners/placeholder.jpg',
            'button_text' => 'Shop Now',
            'button_url' => '/',
            'starts_at' => null,
            'ends_at' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function expired(): static
    {
        return $this->state(fn () => ['ends_at' => now()->subDay()]);
    }

    public function scheduled(): static
    {
        return $this->state(fn () => ['starts_at' => now()->addDay()]);
    }
}
