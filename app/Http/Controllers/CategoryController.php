<?php

namespace App\Http\Controllers;

use App\Concerns\FiltersProducts;
use App\Http\Requests\ProductIndexRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductOptionValue;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    use FiltersProducts;

    public function index(): Response
    {
        return Inertia::render('shop/categories', [
            'categories' => Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
                ->orderBy('sort_order')
                ->get(),
        ]);
    }

    public function show(ProductIndexRequest $request, Category $category): Response
    {
        $categoryIds = $category->children()->pluck('id')->push($category->id);

        $query = Product::query()->whereIn('category_id', $categoryIds)->where('is_active', true);

        $this->applyProductFilters($query, $request);
        $this->applyProductSort($query, $request);

        return Inertia::render('shop/category', [
            'category' => $category,
            'products' => $query->paginate((int) $request->input('per_page', 12))->withQueryString(),
            'colorOptions' => ProductOptionValue::query()
                ->whereHas('optionGroup', fn ($q) => $q->where('kind', 'color'))
                ->select('label')
                ->selectRaw('MIN(hex_color) as hex_color')
                ->groupBy('label')
                ->orderBy('label')
                ->get(),
            'filters' => (object) $request->only(['search', 'min_price', 'max_price', 'color', 'availability', 'sort']),
        ]);
    }
}
