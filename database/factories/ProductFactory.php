<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = ucwords($this->faker->unique()->word().' '.$this->faker->word().' '.$this->faker->word());

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1000, 9999),
            'description' => $this->faker->paragraph(),
            'price_per_sqm' => $this->faker->randomFloat(2, 40, 180),
            'base_price' => $this->faker->randomFloat(2, 10, 40),
            'min_width_cm' => 30,
            'max_width_cm' => 300,
            'min_height_cm' => 30,
            'max_height_cm' => 300,
            'image_path' => null,
            'gallery' => null,
            'is_active' => true,
        ];
    }
}
