<?php

namespace App\Http\Controllers;

use App\Concerns\FiltersProducts;
use App\Enums\MeasurementUnit;
use App\Enums\OrderStatus;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Requests\ProductQuoteRequest;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductOptionValue;
use App\Models\WishlistItem;
use App\Services\BlindPricingService;
use App\Services\CartResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    use FiltersProducts;

    public function __construct(
        private readonly BlindPricingService $pricing,
        private readonly CartResolver $cartResolver,
    ) {}

    public function index(ProductIndexRequest $request): Response
    {
        $query = Product::query()->where('is_active', true)->with('category');

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        }

        $this->applyProductFilters($query, $request);
        $this->applyProductSort($query, $request);

        return Inertia::render('shop/products/index', [
            'products' => $query->paginate((int) $request->input('per_page', 12))->withQueryString(),
            'categories' => Category::query()->whereNull('parent_id')->where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
            'colorOptions' => ProductOptionValue::query()
                ->whereHas('optionGroup', fn ($q) => $q->where('kind', 'color'))
                ->select('label')
                ->selectRaw('MIN(hex_color) as hex_color')
                ->groupBy('label')
                ->orderBy('label')
                ->get(),
            'filters' => (object) $request->only(['search', 'category', 'min_price', 'max_price', 'color', 'availability', 'sort']),
        ]);
    }

    public function show(Request $request, Product $product): Response
    {
        $product->load([
            'category',
            'optionGroups' => fn ($query) => $query->where('is_active', true),
            'optionGroups.values' => fn ($query) => $query->where('is_active', true),
        ]);
        $product->loadCount('approvedReviews as reviews_count')->loadAvg('approvedReviews as reviews_avg_rating', 'rating');

        $relatedProducts = Product::query()
            ->where('is_active', true)
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->take(4)
            ->get();

        $isWishlisted = $request->user()
            ? WishlistItem::query()->where('user_id', $request->user()->id)->where('product_id', $product->id)->exists()
            : false;

        $canReview = $request->user()
            && ! $product->reviews()->where('user_id', $request->user()->id)->exists()
            && OrderItem::query()
                ->where('product_id', $product->id)
                ->whereHas('order', fn ($q) => $q->where('user_id', $request->user()->id)
                    ->whereIn('status', OrderStatus::confirmedStatuses()))
                ->exists();

        $ratingBreakdown = $product->approvedReviews()
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $editingCartItem = null;

        if ($request->filled('edit')) {
            $cart = $this->cartResolver->resolve($request);
            $editingCartItem = $cart->items()->whereKey($request->integer('edit'))->where('product_id', $product->id)->first();
        }

        return Inertia::render('shop/product-show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'isWishlisted' => $isWishlisted,
            'canReview' => $canReview,
            'reviews' => $product->approvedReviews()->with('user:id,first_name,last_name')->latest()->paginate(5),
            'ratingBreakdown' => $ratingBreakdown,
            'editingCartItem' => $editingCartItem,
        ]);
    }

    public function quote(ProductQuoteRequest $request, Product $product): JsonResponse
    {
        $breakdown = $this->pricing->calculate(
            $product,
            (float) $request->validated('width'),
            (float) $request->validated('height'),
            MeasurementUnit::from($request->validated('unit')),
            $request->validated('option_value_ids', []),
        );

        return response()->json($breakdown);
    }
}
