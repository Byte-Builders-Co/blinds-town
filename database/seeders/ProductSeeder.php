<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $productsByCategory = [
            'Roller Blinds' => ['Classic Roller', 'Blockout Roller', 'Sunscreen Roller'],
            'Venetian Blinds' => ['Aluminium Venetian', 'PVC Venetian'],
            'Roman Blinds' => ['Linen Roman', 'Textured Roman'],
            'Vertical Blinds' => ['Fabric Vertical', 'PVC Vertical'],
            'Wooden Blinds' => ['Basswood Venetian', 'Faux Wood Venetian'],
            'Blackout Blinds' => ['Total Blackout Roller', 'Thermal Blackout Roman'],
        ];

        foreach ($productsByCategory as $categoryName => $productNames) {
            $category = Category::query()->where('name', $categoryName)->first();

            if (! $category) {
                continue;
            }

            foreach ($productNames as $name) {
                $product = Product::query()->updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'category_id' => $category->id,
                        'name' => $name,
                        'description' => "The {$name} is a made-to-measure blind, cut precisely to your window.",
                        'price_per_sqm' => fake()->randomFloat(2, 45, 160),
                        'base_price' => fake()->randomFloat(2, 15, 35),
                        'min_width_cm' => 30,
                        'max_width_cm' => 300,
                        'min_height_cm' => 30,
                        'max_height_cm' => 300,
                        'is_active' => true,
                    ],
                );

                if ($product->optionGroups()->exists()) {
                    continue;
                }

                $colorGroup = $product->optionGroups()->create(['name' => 'Color', 'is_required' => true, 'sort_order' => 0]);
                foreach (['White', 'Charcoal', 'Sand', 'Slate Grey'] as $index => $color) {
                    $colorGroup->values()->create([
                        'label' => $color,
                        'price_modifier' => $index === 0 ? 0 : fake()->randomFloat(2, 0, 12),
                        'is_default' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }

                $controlGroup = $product->optionGroups()->create(['name' => 'Control Type', 'is_required' => true, 'sort_order' => 1]);
                foreach (['Cordless', 'Corded', 'Motorised'] as $index => $control) {
                    $controlGroup->values()->create([
                        'label' => $control,
                        'price_modifier' => $control === 'Motorised' ? 89 : 0,
                        'is_default' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }

                $mountGroup = $product->optionGroups()->create(['name' => 'Mount Type', 'is_required' => true, 'sort_order' => 2]);
                foreach (['Inside Mount', 'Outside Mount'] as $index => $mount) {
                    $mountGroup->values()->create([
                        'label' => $mount,
                        'price_modifier' => 0,
                        'is_default' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }
            }
        }
    }
}
