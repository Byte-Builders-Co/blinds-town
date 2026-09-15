<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoryProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Smart Curtains',
                'description' => 'Motorized, app- and voice-controlled curtains for the modern smart home.',
                'products' => [
                    ['name' => 'SmartWave Motorized Curtain', 'price_per_sqm' => 95.00, 'base_price' => 249.00],
                    ['name' => 'LuxConnect Smart Curtain', 'price_per_sqm' => 105.00, 'base_price' => 279.00],
                    ['name' => 'AutoGlide Smart Drapery', 'price_per_sqm' => 89.00, 'base_price' => 229.00],
                    ['name' => 'VoiceControl Smart Curtain', 'price_per_sqm' => 99.00, 'base_price' => 259.00],
                    ['name' => 'HomeSync Motorized Curtain', 'price_per_sqm' => 92.00, 'base_price' => 239.00],
                    ['name' => 'EliteMotion Smart Curtain', 'price_per_sqm' => 110.00, 'base_price' => 299.00],
                ],
            ],
            [
                'name' => 'Zebra Shades',
                'description' => 'Alternating sheer and solid stripes that let you dial in light and privacy.',
                'products' => [
                    ['name' => 'Classic Dual Layer Zebra Shade', 'price_per_sqm' => 55.00, 'base_price' => 45.00],
                    ['name' => 'Premium Stripe Zebra Shade', 'price_per_sqm' => 65.00, 'base_price' => 55.00],
                    ['name' => 'Modern Duo Zebra Shade', 'price_per_sqm' => 58.00, 'base_price' => 49.00],
                    ['name' => 'Elegant Vision Zebra Shade', 'price_per_sqm' => 62.00, 'base_price' => 52.00],
                    ['name' => 'UrbanLine Zebra Shade', 'price_per_sqm' => 50.00, 'base_price' => 39.00],
                    ['name' => 'LuxeView Zebra Shade', 'price_per_sqm' => 70.00, 'base_price' => 59.00],
                ],
            ],
            [
                'name' => 'Blackout Prints',
                'description' => 'Printed, fully light-blocking roller fabrics for bedrooms and media rooms.',
                'products' => [
                    ['name' => 'Floral Night Blackout Print', 'price_per_sqm' => 60.00, 'base_price' => 49.00],
                    ['name' => 'Geometric Blackout Print', 'price_per_sqm' => 63.00, 'base_price' => 52.00],
                    ['name' => 'NatureView Blackout Print', 'price_per_sqm' => 65.00, 'base_price' => 55.00],
                    ['name' => 'Luxury Pattern Blackout Print', 'price_per_sqm' => 75.00, 'base_price' => 65.00],
                    ['name' => 'Modern Art Blackout Print', 'price_per_sqm' => 68.00, 'base_price' => 58.00],
                    ['name' => 'Kids Dream Blackout Print', 'price_per_sqm' => 58.00, 'base_price' => 45.00],
                ],
            ],
            [
                'name' => 'Cellular Shades',
                'description' => 'Honeycomb-structured shades that trap air for extra insulation.',
                'products' => [
                    ['name' => 'Classic Honeycomb Cellular Shade', 'price_per_sqm' => 62.00, 'base_price' => 55.00],
                    ['name' => 'Double Cell Insulated Shade', 'price_per_sqm' => 78.00, 'base_price' => 69.00],
                    ['name' => 'Premium Energy Saver Cellular', 'price_per_sqm' => 85.00, 'base_price' => 79.00],
                    ['name' => 'SoftLight Cellular Shade', 'price_per_sqm' => 60.00, 'base_price' => 52.00],
                    ['name' => 'ThermalGuard Cellular Shade', 'price_per_sqm' => 82.00, 'base_price' => 75.00],
                    ['name' => 'LuxeCell Cellular Shade', 'price_per_sqm' => 90.00, 'base_price' => 89.00],
                ],
            ],
            [
                'name' => 'Roller Shades',
                'description' => 'Simple, sleek roller shades that suit any room.',
                'products' => [
                    ['name' => 'Classic Fabric Roller Shade', 'price_per_sqm' => 45.00, 'base_price' => 29.00],
                    ['name' => 'Premium Sunscreen Roller Shade', 'price_per_sqm' => 55.00, 'base_price' => 39.00],
                    ['name' => 'Modern Linen Roller Shade', 'price_per_sqm' => 50.00, 'base_price' => 35.00],
                    ['name' => 'EasyView Roller Shade', 'price_per_sqm' => 42.00, 'base_price' => 27.00],
                    ['name' => 'Executive Blackout Roller Shade', 'price_per_sqm' => 60.00, 'base_price' => 49.00],
                    ['name' => 'UrbanStyle Roller Shade', 'price_per_sqm' => 48.00, 'base_price' => 33.00],
                ],
            ],
        ];

        foreach ($categories as $categoryIndex => $categoryData) {
            $category = Category::query()->updateOrCreate(
                ['slug' => Str::slug($categoryData['name'])],
                [
                    'name' => $categoryData['name'],
                    'short_description' => $categoryData['description'],
                    'description' => $categoryData['description'],
                    'sort_order' => $categoryIndex,
                    'is_featured' => true,
                    'is_active' => true,
                ],
            );

            foreach ($categoryData['products'] as $productIndex => $productData) {
                $sku = sprintf(
                    '%s-%03d',
                    Str::upper(Str::substr(Str::slug($categoryData['name'], ''), 0, 3)),
                    $productIndex + 1,
                );

                $product = Product::query()->updateOrCreate(
                    ['slug' => Str::slug($productData['name'])],
                    [
                        'category_id' => $category->id,
                        'sku' => $sku,
                        'name' => $productData['name'],
                        'description' => "The {$productData['name']} is a made-to-measure {$categoryData['name']}, cut precisely to your window.",
                        'price_per_sqm' => $productData['price_per_sqm'],
                        'base_price' => $productData['base_price'],
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
                        'price_modifier' => $index === 0 ? 0 : 5 + $index * 2,
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
