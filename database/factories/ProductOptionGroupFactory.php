<?php

namespace Database\Factories;

use App\Enums\OptionGroupKind;
use App\Enums\OptionSelectionType;
use App\Models\Product;
use App\Models\ProductOptionGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductOptionGroup>
 */
class ProductOptionGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => $this->faker->randomElement(['Color', 'Control Type', 'Mount Type']),
            'kind' => OptionGroupKind::Custom,
            'selection_type' => OptionSelectionType::Single,
            'is_required' => true,
            'sort_order' => 0,
        ];
    }

    public function fabric(): static
    {
        return $this->state(['name' => 'Fabric', 'kind' => OptionGroupKind::Fabric]);
    }

    public function mountType(): static
    {
        return $this->state(['name' => 'Mount Type', 'kind' => OptionGroupKind::MountType]);
    }

    public function controlType(): static
    {
        return $this->state(['name' => 'Control Type', 'kind' => OptionGroupKind::ControlType]);
    }

    public function multiSelect(): static
    {
        return $this->state(['selection_type' => OptionSelectionType::Multiple]);
    }
}
