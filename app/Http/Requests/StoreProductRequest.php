<?php

namespace App\Http\Requests;

use App\Enums\OptionGroupKind;
use App\Enums\OptionSelectionType;
use App\Enums\PricingTierType;
use App\Enums\StockStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
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
        return [
            'sku' => ['nullable', 'string', 'max:255', 'unique:products,sku'],
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
            'stock_units' => ['required', 'integer', 'min:0', 'max:1000000'],

            'option_groups' => ['array'],
            'option_groups.*.name' => ['required', 'string', 'max:255'],
            'option_groups.*.kind' => ['required', Rule::enum(OptionGroupKind::class)],
            'option_groups.*.selection_type' => ['required', Rule::enum(OptionSelectionType::class)],
            'option_groups.*.is_required' => ['boolean'],
            'option_groups.*.is_active' => ['boolean'],
            // A group can only depend on a value that already exists, which is impossible
            // for a brand-new product — compatibility rules are wired up after creation.
            'option_groups.*.requires_option_value_id' => ['prohibited'],
            'option_groups.*.values' => ['array', 'min:1'],
            'option_groups.*.values.*.label' => ['required', 'string', 'max:255'],
            'option_groups.*.values.*.image' => ['nullable', 'image', 'max:4096'],
            'option_groups.*.values.*.hex_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'option_groups.*.values.*.price_modifier' => ['required', 'numeric'],
            'option_groups.*.values.*.price_per_sqm' => ['nullable', 'numeric', 'min:0'],
            'option_groups.*.values.*.instructions' => ['nullable', 'string'],
            'option_groups.*.values.*.is_default' => ['boolean'],
            'option_groups.*.values.*.is_active' => ['boolean'],
            'option_groups.*.values.*.requires_option_value_id' => ['prohibited'],

            'pricing_tiers' => ['array'],
            'pricing_tiers.*.min_area_sqm' => ['required', 'numeric', 'min:0'],
            'pricing_tiers.*.max_area_sqm' => ['nullable', 'numeric', 'gt:pricing_tiers.*.min_area_sqm'],
            'pricing_tiers.*.pricing_type' => ['required', Rule::enum(PricingTierType::class)],
            'pricing_tiers.*.price' => ['required', 'numeric', 'min:0'],
            'pricing_tiers.*.is_active' => ['boolean'],
        ];
    }
}
