<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Roller Blinds',
                'description' => 'Simple, sleek roller blinds for any room.',
                'featured' => true,
                'children' => ['Blackout Roller Blinds', 'Sunscreen Roller Blinds', 'Thermal Roller Blinds'],
            ],
            [
                'name' => 'Zebra Blinds',
                'description' => 'Alternating sheer and solid stripes for adjustable light and privacy.',
                'featured' => true,
                'children' => ['Standard Zebra', 'Blackout Zebra'],
            ],
            ['name' => 'Roman Blinds', 'description' => 'Soft fabric folds for a warm, tailored look.', 'featured' => true],
            ['name' => 'Vertical Blinds', 'description' => 'Ideal for large windows and sliding doors.'],
            ['name' => 'Venetian Blinds', 'description' => 'Classic horizontal slat blinds with adjustable light control.', 'featured' => true],
            ['name' => 'Wooden Blinds', 'description' => 'Natural wood slats for a timeless finish.'],
            ['name' => 'Motorized Blinds', 'description' => 'Remote and app-controlled blinds for effortless operation.'],
            ['name' => 'Outdoor Blinds', 'description' => 'Weather-resistant blinds for patios and porches.'],
            ['name' => 'Blackout Blinds', 'description' => 'Total light blocking for bedrooms and media rooms.'],
            ['name' => 'Other Blinds', 'description' => 'Specialty and made-to-order blind styles.'],
        ];

        foreach ($categories as $index => $category) {
            $parent = Category::query()->updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'short_description' => $category['description'],
                    'description' => $category['description'],
                    'sort_order' => $index,
                    'is_featured' => $category['featured'] ?? false,
                    'is_active' => true,
                ],
            );

            foreach ($category['children'] ?? [] as $childIndex => $childName) {
                Category::query()->updateOrCreate(
                    ['slug' => Str::slug($childName)],
                    [
                        'parent_id' => $parent->id,
                        'name' => $childName,
                        'short_description' => "{$childName} — a {$category['name']} variant.",
                        'sort_order' => $childIndex,
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
