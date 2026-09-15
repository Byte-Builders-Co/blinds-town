<?php

namespace App\Concerns;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait FiltersProducts
{
    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    private function applyProductFilters(Builder $query, Request $request): Builder
    {
        return $query
            ->search($request->string('search')->toString() ?: null)
            ->priceBetween(
                $request->filled('min_price') ? (float) $request->input('min_price') : null,
                $request->filled('max_price') ? (float) $request->input('max_price') : null,
            )
            ->withColorLabels($this->stringArray($request->input('color', [])))
            ->availability($request->string('availability')->toString() ?: null);
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    private function applyProductSort(Builder $query, Request $request): Builder
    {
        return match ($request->string('sort', 'featured')->toString()) {
            'newest' => $query->orderByDesc('created_at'),
            'price_low' => $query->orderBy('base_price'),
            'price_high' => $query->orderByDesc('base_price'),
            'name_asc' => $query->orderBy('name'),
            'name_desc' => $query->orderByDesc('name'),
            'popular' => $query->withCount('approvedReviews as reviews_count')->orderByDesc('reviews_count'),
            'rating' => $query->withAvg('approvedReviews as reviews_avg_rating', 'rating')->orderByDesc('reviews_avg_rating'),
            default => $query->orderByDesc('is_featured')->orderBy('name'),
        };
    }

    /**
     * @param  mixed  $value
     * @return array<int, string>
     */
    private function stringArray($value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_map('strval', array_filter($value, fn ($item) => is_string($item) || is_numeric($item))));
    }
}
