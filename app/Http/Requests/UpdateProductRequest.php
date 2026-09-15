<?php

namespace App\Http\Requests;

use App\Enums\OptionGroupKind;
use App\Enums\OptionSelectionType;
use App\Enums\PricingTierType;
use App\Enums\StockStatus;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Product $product */
        $product = $this->route('product');

        $existingValueIds = $product->optionGroups()
            ->with('values:id,product_option_group_id')
            ->get()
            ->flatMap(fn ($group) => $group->values->pluck('id'));

        return [
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($product->id)],
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_per_sqm' => ['required', 'numeric', 'min:0'],
            'min_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'tax_rate_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'min_width_cm' => ['required', 'integer', 'min:1'],
            'max_width_cm' => ['required', 'integer', 'gte:min_width_cm'],
            'min_height_cm' => ['required', 'integer', 'min:1'],
            'max_height_cm' => ['required', 'integer', 'gte:min_height_cm'],
            'measurement_unit_default' => ['required', 'string', 'in:cm,inch'],
            'image' => ['nullable', 'image', 'max:4096'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'stock_status' => ['required', Rule::enum(StockStatus::class)],

            'option_groups' => ['array'],
            'option_groups.*.id' => ['nullable', 'integer', 'exists:product_option_groups,id'],
            'option_groups.*.name' => ['required', 'string', 'max:255'],
            'option_groups.*.kind' => ['required', Rule::enum(OptionGroupKind::class)],
            'option_groups.*.selection_type' => ['required', Rule::enum(OptionSelectionType::class)],
            'option_groups.*.is_required' => ['boolean'],
            'option_groups.*.is_active' => ['boolean'],
            'option_groups.*.requires_option_value_id' => ['nullable', 'integer', Rule::in($existingValueIds)],
            'option_groups.*.values' => ['array', 'min:1'],
            'option_groups.*.values.*.id' => ['nullable', 'integer', 'exists:product_option_values,id'],
            'option_groups.*.values.*.label' => ['required', 'string', 'max:255'],
            'option_groups.*.values.*.image' => ['nullable', 'image', 'max:4096'],
            'option_groups.*.values.*.hex_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'option_groups.*.values.*.price_modifier' => ['required', 'numeric'],
            'option_groups.*.values.*.price_per_sqm' => ['nullable', 'numeric', 'min:0'],
            'option_groups.*.values.*.instructions' => ['nullable', 'string'],
            'option_groups.*.values.*.is_default' => ['boolean'],
            'option_groups.*.values.*.is_active' => ['boolean'],
            'option_groups.*.values.*.requires_option_value_id' => ['nullable', 'integer', Rule::in($existingValueIds)],

            'pricing_tiers' => ['array'],
            'pricing_tiers.*.id' => ['nullable', 'integer', 'exists:product_pricing_tiers,id'],
            'pricing_tiers.*.min_area_sqm' => ['required', 'numeric', 'min:0'],
            'pricing_tiers.*.max_area_sqm' => ['nullable', 'numeric', 'gt:pricing_tiers.*.min_area_sqm'],
            'pricing_tiers.*.pricing_type' => ['required', Rule::enum(PricingTierType::class)],
            'pricing_tiers.*.price' => ['required', 'numeric', 'min:0'],
            'pricing_tiers.*.is_active' => ['boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            foreach ($this->input('option_groups', []) as $groupIndex => $group) {
                foreach (($group['values'] ?? []) as $valueIndex => $value) {
                    if (isset($value['id'], $value['requires_option_value_id'])
                        && (int) $value['requires_option_value_id'] === (int) $value['id']) {
                        $validator->errors()->add(
                            "option_groups.{$groupIndex}.values.{$valueIndex}.requires_option_value_id",
                            'An option cannot require itself.',
                        );
                    }
                }
            }
        });
    }
}
