<?php

namespace App\Services;

use App\Enums\MeasurementUnit;
use App\Enums\OptionGroupKind;
use App\Models\Product;
use App\Models\ProductOptionGroup;
use App\Models\ProductOptionValue;
use App\Models\ProductPricingTier;
use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class BlindPricingService
{
    /**
     * Normalize the given width/height to centimeters and assert they fall
     * within the product's configured bounds. Throws a ValidationException
     * (with the same field names the storefront form submits) if not.
     */
    public function validateMeasurement(Product $product, float $width, float $height, MeasurementUnit $unit): void
    {
        $widthCm = $unit->toCm($width);
        $heightCm = $unit->toCm($height);

        $errors = [];

        [$minWidth, $maxWidth] = $this->boundsInUnit($product->min_width_cm, $product->max_width_cm, $unit);
        [$minHeight, $maxHeight] = $this->boundsInUnit($product->min_height_cm, $product->max_height_cm, $unit);

        if ($widthCm < $product->min_width_cm || $widthCm > $product->max_width_cm) {
            $errors['width'] = ["Width must be between {$minWidth} and {$maxWidth} {$unit->value}."];
        }

        if ($heightCm < $product->min_height_cm || $heightCm > $product->max_height_cm) {
            $errors['height'] = ["Height must be between {$minHeight} and {$maxHeight} {$unit->value}."];
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    /**
     * Calculate the full, itemized price breakdown for a configured blind.
     *
     * Only active, compatibility-satisfied option values are ever priced —
     * disabled options and options whose `requires_option_value_id`
     * prerequisite isn't in the selected set are silently ignored, exactly
     * like ids that don't belong to this product.
     *
     * @param  array<int, int>  $optionValueIds
     * @return array{
     *     width_cm: float, height_cm: float, unit: string,
     *     area_sqm: float, billable_area_sqm: float,
     *     base_price: float, fabric_cost: float, option_adjustments: float,
     *     mount_charge: float, control_charge: float,
     *     subtotal: float, product_discount: float, taxable_amount: float,
     *     tax_rate_percent: float, tax_amount: float,
     *     final_price: float, customization_total: float, discount: float,
     *     gst: float, breakdown: array<int, array{key: string, group: string|null, kind: string|null, label: string, amount: float}>,
     * }
     */
    public function calculate(Product $product, float $width, float $height, MeasurementUnit $unit, array $optionValueIds = []): array
    {
        $this->validateMeasurement($product, $width, $height, $unit);

        $widthCm = $unit->toCm($width);
        $heightCm = $unit->toCm($height);

        $areaSqm = ($widthCm / 100) * ($heightCm / 100);
        $minAreaSqm = $product->min_area_sqm !== null ? (float) $product->min_area_sqm : null;
        $billableAreaSqm = $minAreaSqm !== null ? max($areaSqm, $minAreaSqm) : $areaSqm;

        $product->loadMissing('optionGroups.values');

        $values = $this->resolveSelectedValues($product, $optionValueIds);

        $breakdown = [];

        $basePrice = (float) $product->base_price;
        $breakdown[] = ['key' => 'base_price', 'group' => null, 'kind' => null, 'label' => 'Base Price', 'amount' => round($basePrice, 2)];

        $areaCost = round($this->areaCost($product, $billableAreaSqm), 2);
        $fabricCost = $areaCost;

        if ($areaCost !== 0.0) {
            $breakdown[] = ['key' => 'area', 'group' => null, 'kind' => null, 'label' => 'Size / Area', 'amount' => $areaCost];
        }

        $optionAdjustments = 0.0;
        $mountCharge = 0.0;
        $controlCharge = 0.0;

        foreach ($values as $value) {
            /** @var ProductOptionValue $value */
            $kind = $value->optionGroup->kind;

            if ($value->price_per_sqm !== null) {
                $amount = round($billableAreaSqm * (float) $value->price_per_sqm, 2);
                $fabricCost += $amount;
            } else {
                $amount = round((float) $value->price_modifier, 2);

                match ($kind) {
                    OptionGroupKind::MountType => $mountCharge += $amount,
                    OptionGroupKind::ControlType => $controlCharge += $amount,
                    default => $optionAdjustments += $amount,
                };
            }

            if ($amount !== 0.0) {
                $breakdown[] = [
                    'key' => "option:{$value->id}",
                    'group' => $value->optionGroup->name,
                    'kind' => $kind->value,
                    'label' => $value->label,
                    'amount' => $amount,
                ];
            }
        }

        $subtotal = round($basePrice + $fabricCost + $optionAdjustments + $mountCharge + $controlCharge, 2);

        $discountPercent = $product->discount_percent !== null ? (float) $product->discount_percent : 0.0;
        $productDiscount = round($subtotal * $discountPercent / 100, 2);
        $taxableAmount = max(0.0, round($subtotal - $productDiscount, 2));

        if ($productDiscount > 0) {
            $breakdown[] = ['key' => 'discount', 'group' => null, 'kind' => null, 'label' => 'Discount', 'amount' => -$productDiscount];
        }

        $taxRatePercent = Setting::get('tax.gst_enabled', true)
            ? ($product->tax_rate_percent !== null ? (float) $product->tax_rate_percent : (float) Setting::get('tax.gst_rate', 0))
            : 0.0;
        $taxAmount = round($taxableAmount * $taxRatePercent / 100, 2);

        if ($taxAmount > 0) {
            $breakdown[] = ['key' => 'gst', 'group' => null, 'kind' => null, 'label' => "GST ({$taxRatePercent}%)", 'amount' => $taxAmount];
        }

        $finalPrice = max(0.0, round($taxableAmount + $taxAmount, 2));

        return [
            'width_cm' => $widthCm,
            'height_cm' => $heightCm,
            'unit' => $unit->value,
            'area_sqm' => round($areaSqm, 2),
            'billable_area_sqm' => round($billableAreaSqm, 2),
            'base_price' => round($basePrice, 2),
            'fabric_cost' => round($fabricCost, 2),
            'option_adjustments' => round($optionAdjustments, 2),
            'mount_charge' => round($mountCharge, 2),
            'control_charge' => round($controlCharge, 2),
            'subtotal' => $subtotal,
            'product_discount' => $productDiscount,
            'taxable_amount' => $taxableAmount,
            'tax_rate_percent' => $taxRatePercent,
            'tax_amount' => $taxAmount,
            'final_price' => $finalPrice,
            'customization_total' => round($subtotal - $basePrice, 2),
            'discount' => $productDiscount,
            'gst' => $taxAmount,
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Resolve which submitted option value ids are actually selectable for
     * this product: the value and its group must both be active, and any
     * `requires_option_value_id` prerequisite (on either the value or its
     * group) must also be present in the submitted set. Everything else
     * (ids from another product, disabled options, ungated dependents) is
     * dropped rather than erroring — validation of the raw input happens
     * separately in ValidatesBlindConfiguration.
     *
     * @param  array<int, int>  $optionValueIds
     * @return Collection<int, ProductOptionValue>
     */
    private function resolveSelectedValues(Product $product, array $optionValueIds): Collection
    {
        $activeValueIds = $product->optionGroups
            ->filter(fn (ProductOptionGroup $group) => $group->is_active)
            ->flatMap(fn (ProductOptionGroup $group) => $group->values->filter(fn (ProductOptionValue $value) => $value->is_active))
            ->pluck('id');

        $candidateIds = collect($optionValueIds)->intersect($activeValueIds);

        $selected = collect();

        foreach ($product->optionGroups as $group) {
            if (! $group->is_active) {
                continue;
            }

            if ($group->requires_option_value_id !== null && ! $candidateIds->contains($group->requires_option_value_id)) {
                continue;
            }

            foreach ($group->values as $value) {
                if (! $value->is_active || ! $candidateIds->contains($value->id)) {
                    continue;
                }

                if ($value->requires_option_value_id !== null && ! $candidateIds->contains($value->requires_option_value_id)) {
                    continue;
                }

                $value->setRelation('optionGroup', $group);
                $selected->push($value);
            }
        }

        return $selected;
    }

    /**
     * The product's own area-based cost: an admin-configured pricing tier
     * bracket when any are active for this product, otherwise the linear
     * `price_per_sqm * area` calculation used historically.
     */
    private function areaCost(Product $product, float $billableAreaSqm): float
    {
        $tier = ProductPricingTier::query()
            ->where('product_id', $product->id)
            ->active()
            ->orderBy('sort_order')
            ->get()
            ->first(fn (ProductPricingTier $tier) => $tier->matches($billableAreaSqm));

        if ($tier !== null) {
            return $tier->priceForArea($billableAreaSqm);
        }

        return $billableAreaSqm * (float) $product->price_per_sqm;
    }

    /**
     * @return array{0: float, 1: float}
     */
    private function boundsInUnit(int $minCm, int $maxCm, MeasurementUnit $unit): array
    {
        if ($unit === MeasurementUnit::Cm) {
            return [(float) $minCm, (float) $maxCm];
        }

        return [round($minCm / 2.54, 1), round($maxCm / 2.54, 1)];
    }
}
