<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StockStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Columns the index table can be sorted by, mapped to their
     * fully-qualified column (category name lives on `categories`).
     *
     * @var array<string, string>
     */
    private const SORTABLE_COLUMNS = [
        'id' => 'products.id',
        'name' => 'products.name',
        'category' => 'categories.name',
        'price' => 'products.base_price',
        'stock' => 'products.stock_status',
        'status' => 'products.is_active',
        'updated_at' => 'products.updated_at',
    ];

    public function index(Request $request): Response
    {
        $sort = $request->string('sort')->toString();
        $sortColumn = self::SORTABLE_COLUMNS[$sort] ?? self::SORTABLE_COLUMNS['name'];
        $direction = $request->string('direction')->toString() === 'desc' ? 'desc' : 'asc';

        return Inertia::render('admin/products/index', [
            'products' => Product::query()
                ->select('products.*')
                ->join('categories', 'categories.id', '=', 'products.category_id')
                ->with('category')
                ->search($request->string('search')->toString())
                ->when($request->string('stock_status')->toString(), fn ($query, $stockStatus) => $query->where('products.stock_status', $stockStatus))
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('products.is_active', $status === 'active'))
                ->orderBy($sortColumn, $direction)
                ->paginate(15)
                ->withQueryString(),
            'stockStatuses' => StockStatus::cases(),
            'filters' => [
                ...$request->only(['search', 'sort', 'stock_status', 'status']),
                'direction' => $direction,
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        return Inertia::render('admin/products/show', [
            'product' => $product->load('category', 'optionGroups.values', 'pricingTiers'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', [
            'categories' => Category::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'parent_id']),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $product = DB::transaction(function () use ($request) {
            $data = $request->safe()->except(['image', 'option_groups', 'pricing_tiers']);
            $data['slug'] = $this->uniqueSlug($request->validated('name'));

            if ($request->hasFile('image')) {
                $data['image_path'] = $request->file('image')->store('products', 'public');
            }

            $product = Product::query()->create($data);

            foreach ($request->validated('option_groups', []) as $groupIndex => $groupData) {
                $group = $product->optionGroups()->create([
                    'name' => $groupData['name'],
                    'kind' => $groupData['kind'],
                    'selection_type' => $groupData['selection_type'],
                    'is_required' => $groupData['is_required'] ?? true,
                    'is_active' => $groupData['is_active'] ?? true,
                    'sort_order' => $groupIndex,
                ]);

                foreach ($groupData['values'] as $valueIndex => $valueData) {
                    $imagePath = isset($valueData['image']) && $valueData['image'] instanceof UploadedFile
                        ? $valueData['image']->store('product-options', 'public')
                        : null;

                    $group->values()->create([
                        'label' => $valueData['label'],
                        'image_path' => $imagePath,
                        'hex_color' => $valueData['hex_color'] ?? null,
                        'price_modifier' => $valueData['price_modifier'],
                        'price_per_sqm' => $valueData['price_per_sqm'] ?? null,
                        'instructions' => $valueData['instructions'] ?? null,
                        'is_default' => $valueData['is_default'] ?? false,
                        'is_active' => $valueData['is_active'] ?? true,
                        'sort_order' => $valueIndex,
                    ]);
                }
            }

            foreach ($request->validated('pricing_tiers', []) as $tierIndex => $tierData) {
                $product->pricingTiers()->create([
                    'min_area_sqm' => $tierData['min_area_sqm'],
                    'max_area_sqm' => $tierData['max_area_sqm'] ?? null,
                    'pricing_type' => $tierData['pricing_type'],
                    'price' => $tierData['price'],
                    'is_active' => $tierData['is_active'] ?? true,
                    'sort_order' => $tierIndex,
                ]);
            }

            return $product;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$product->name} created."]);

        return redirect()->route('admin.products.edit', $product);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => $product->load('optionGroups.values', 'pricingTiers'),
            'categories' => Category::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'parent_id']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product) {
            $data = $request->safe()->except(['image', 'option_groups', 'pricing_tiers']);

            if ($data['name'] !== $product->name) {
                $data['slug'] = $this->uniqueSlug($request->validated('name'), $product->id);
            }

            if ($request->hasFile('image')) {
                if ($product->image_path) {
                    Storage::disk('public')->delete($product->image_path);
                }

                $data['image_path'] = $request->file('image')->store('products', 'public');
            }

            $product->update($data);

            $keepGroupIds = [];

            foreach ($request->validated('option_groups', []) as $groupIndex => $groupData) {
                $group = isset($groupData['id'])
                    ? $product->optionGroups()->whereKey($groupData['id'])->firstOrFail()
                    : $product->optionGroups()->make();

                $group->fill([
                    'name' => $groupData['name'],
                    'kind' => $groupData['kind'],
                    'selection_type' => $groupData['selection_type'],
                    'is_required' => $groupData['is_required'] ?? true,
                    'is_active' => $groupData['is_active'] ?? true,
                    'requires_option_value_id' => $groupData['requires_option_value_id'] ?? null,
                    'sort_order' => $groupIndex,
                ]);
                $group->product()->associate($product);
                $group->save();
                $keepGroupIds[] = $group->id;

                $keepValueIds = [];

                foreach ($groupData['values'] as $valueIndex => $valueData) {
                    $value = isset($valueData['id'])
                        ? $group->values()->whereKey($valueData['id'])->firstOrFail()
                        : $group->values()->make();

                    if (isset($valueData['image']) && $valueData['image'] instanceof UploadedFile) {
                        if ($value->image_path) {
                            Storage::disk('public')->delete($value->image_path);
                        }

                        $storedPath = $valueData['image']->store('product-options', 'public');
                        $value->image_path = $storedPath !== false ? $storedPath : null;
                    }

                    $value->fill([
                        'label' => $valueData['label'],
                        'hex_color' => $valueData['hex_color'] ?? null,
                        'price_modifier' => $valueData['price_modifier'],
                        'price_per_sqm' => $valueData['price_per_sqm'] ?? null,
                        'instructions' => $valueData['instructions'] ?? null,
                        'is_default' => $valueData['is_default'] ?? false,
                        'is_active' => $valueData['is_active'] ?? true,
                        'requires_option_value_id' => $valueData['requires_option_value_id'] ?? null,
                        'sort_order' => $valueIndex,
                    ]);
                    $value->optionGroup()->associate($group);
                    $value->save();
                    $keepValueIds[] = $value->id;
                }

                $valuesToDelete = $group->values()->whereKeyNot($keepValueIds)->get();

                foreach ($valuesToDelete as $valueToDelete) {
                    if ($valueToDelete->image_path) {
                        Storage::disk('public')->delete($valueToDelete->image_path);
                    }
                }

                $group->values()->whereKeyNot($keepValueIds)->delete();
            }

            $product->optionGroups()->whereKeyNot($keepGroupIds)->delete();

            $keepTierIds = [];

            foreach ($request->validated('pricing_tiers', []) as $tierIndex => $tierData) {
                $tier = isset($tierData['id'])
                    ? $product->pricingTiers()->whereKey($tierData['id'])->firstOrFail()
                    : $product->pricingTiers()->make();

                $tier->fill([
                    'min_area_sqm' => $tierData['min_area_sqm'],
                    'max_area_sqm' => $tierData['max_area_sqm'] ?? null,
                    'pricing_type' => $tierData['pricing_type'],
                    'price' => $tierData['price'],
                    'is_active' => $tierData['is_active'] ?? true,
                    'sort_order' => $tierIndex,
                ]);
                $tier->product()->associate($product);
                $tier->save();
                $keepTierIds[] = $tier->id;
            }

            $product->pricingTiers()->whereKeyNot($keepTierIds)->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$product->name} updated."]);

        return redirect()->route('admin.products.edit', $product);
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$product->name} deleted."]);

        return redirect()->route('admin.products.index');
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (Product::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-".++$suffix;
        }

        return $slug;
    }
}
