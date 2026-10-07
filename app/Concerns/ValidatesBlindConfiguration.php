<?php

namespace App\Concerns;

use App\Enums\MeasurementUnit;
use App\Models\Product;
use App\Models\ProductOptionGroup;
use App\Models\ProductOptionValue;
use App\Services\BlindPricingService;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

trait ValidatesBlindConfiguration
{
    private function validateBlindConfiguration(Validator $validator, Product $product, string $width, string $height, string $unitValue, mixed $optionValueIds): void
    {
        $product->loadMissing('optionGroups.values');

        $unit = MeasurementUnit::tryFrom($unitValue);

        if ($unit === null) {
            return;
        }

        try {
            app(BlindPricingService::class)->validateMeasurement($product, (float) $width, (float) $height, $unit);
        } catch (ValidationException $exception) {
            foreach ($exception->errors() as $field => $messages) {
                foreach ($messages as $message) {
                    $validator->errors()->add($field, $message);
                }
            }
        }

        /** @var array<int, int> $selectedIdsInput */
        $selectedIdsInput = is_array($optionValueIds) ? $optionValueIds : [];
        $selectedIds = collect($selectedIdsInput);

        $activeValueIds = $product->optionGroups
            ->filter(fn (ProductOptionGroup $group) => $group->is_active)
            ->flatMap(fn (ProductOptionGroup $group) => $group->values->filter(fn (ProductOptionValue $value) => $value->is_active))
            ->pluck('id');

        $candidateIds = $selectedIds->intersect($activeValueIds);

        foreach ($product->optionGroups as $group) {
            if (! $group->is_active) {
                continue;
            }

            $validIds = $group->values->pluck('id');
            $selectedForGroup = $selectedIds->intersect($validIds);

            $groupSatisfied = $group->requires_option_value_id === null || $candidateIds->contains($group->requires_option_value_id);

            if (! $groupSatisfied) {
                if ($selectedForGroup->isNotEmpty()) {
                    $prerequisite = $this->labelForValue($product, $group->requires_option_value_id);
                    $validator->errors()->add('option_value_ids', "\"{$group->name}\" requires \"{$prerequisite}\" to be selected.");
                }

                continue;
            }

            if ($group->is_required && $selectedForGroup->isEmpty()) {
                $validator->errors()->add('option_value_ids', "Please select an option for \"{$group->name}\".");
            }

            if ($group->isSingleSelect() && $selectedForGroup->count() > 1) {
                $validator->errors()->add('option_value_ids', "Only one option may be selected for \"{$group->name}\".");
            }

            foreach ($group->values as $value) {
                if (! $selectedForGroup->contains($value->id)) {
                    continue;
                }

                if (! $value->is_active) {
                    $validator->errors()->add('option_value_ids', "\"{$value->label}\" is no longer available.");

                    continue;
                }

                if ($value->requires_option_value_id !== null && ! $candidateIds->contains($value->requires_option_value_id)) {
                    $prerequisite = $this->labelForValue($product, $value->requires_option_value_id);
                    $validator->errors()->add('option_value_ids', "\"{$value->label}\" requires \"{$prerequisite}\" to be selected.");
                }
            }
        }
    }

    private function labelForValue(Product $product, ?int $valueId): string
    {
        if ($valueId === null) {
            return '';
        }

        return $product->optionGroups
            ->flatMap(fn (ProductOptionGroup $group) => $group->values)
            ->firstWhere('id', $valueId)
            ->label ?? 'a required option';
    }
}
