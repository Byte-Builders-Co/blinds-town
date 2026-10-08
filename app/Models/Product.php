<?php

namespace App\Models;

use App\Enums\StockStatus;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $sku
 * @property int $category_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string $price_per_sqm
 * @property string|null $min_area_sqm
 * @property string $base_price
 * @property string|null $tax_rate_percent
 * @property string|null $discount_percent
 * @property int $min_width_cm
 * @property int $max_width_cm
 * @property int $min_height_cm
 * @property int $max_height_cm
 * @property string $measurement_unit_default
 * @property string|null $image_path
 * @property array<int, string>|null $gallery
 * @property bool $is_active
 * @property bool $is_featured
 * @property StockStatus $stock_status
 * @property int $stock_units
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Category $category
 * @property-read Collection<int, ProductOptionGroup> $optionGroups
 * @property-read Collection<int, ProductReview> $reviews
 * @property-read float|null $sale_price
 * @property-read int $reviews_count
 * @property-read float $reviews_avg_rating
 */
#[Fillable([
    'sku',
    'category_id',
    'name',
    'slug',
    'description',
    'price_per_sqm',
    'min_area_sqm',
    'base_price',
    'tax_rate_percent',
    'discount_percent',
    'min_width_cm',
    'max_width_cm',
    'min_height_cm',
    'max_height_cm',
    'measurement_unit_default',
    'image_path',
    'gallery',
    'is_active',
    'is_featured',
    'stock_status',
    'stock_units',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    use SoftDeletes;

    /** @var list<string> */
    protected $appends = ['sale_price'];

    protected static function booted(): void
    {
        // Stock units drive the customer-facing status: 0 units is out of stock.
        // An explicitly set stock_status (e.g. seeds, imports) is left alone.
        static::saving(function (Product $product) {
            if ($product->isDirty('stock_units') && ! $product->isDirty('stock_status')) {
                $product->stock_status = $product->stock_units > 0 ? StockStatus::InStock : StockStatus::OutOfStock;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'price_per_sqm' => 'decimal:2',
            'min_area_sqm' => 'decimal:2',
            'base_price' => 'decimal:2',
            'tax_rate_percent' => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'gallery' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'stock_status' => StockStatus::class,
            'stock_units' => 'integer',
            // withAvg()/loadAvg() populate this as a raw DB aggregate, which
            // PDO returns as a numeric string — cast it so every consumer
            // (frontend .toFixed() calls included) always gets a real float.
            'reviews_avg_rating' => 'float',
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<ProductOptionGroup, $this>
     */
    public function optionGroups(): HasMany
    {
        return $this->hasMany(ProductOptionGroup::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<ProductPricingTier, $this>
     */
    public function pricingTiers(): HasMany
    {
        return $this->hasMany(ProductPricingTier::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<ProductReview, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * @return HasMany<ProductReview, $this>
     */
    public function approvedReviews(): HasMany
    {
        return $this->reviews()->approved();
    }

    /**
     * @return Attribute<float|null, never>
     */
    protected function salePrice(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->discount_percent !== null
                ? round((float) $this->base_price * (1 - (float) $this->discount_percent / 100), 2)
                : null,
        );
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || trim($term) === '') {
            return $query;
        }

        return $query->where(function (Builder $query) use ($term) {
            $query->where('products.name', 'like', "%{$term}%")
                ->orWhere('products.description', 'like', "%{$term}%")
                ->orWhere('products.sku', 'like', "%{$term}%")
                ->orWhereHas('category', fn (Builder $query) => $query->where('name', 'like', "%{$term}%"));
        });
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopePriceBetween(Builder $query, ?float $min, ?float $max): Builder
    {
        if ($min !== null) {
            $query->where('base_price', '>=', $min);
        }

        if ($max !== null) {
            $query->where('base_price', '<=', $max);
        }

        return $query;
    }

    /**
     * @param  Builder<Product>  $query
     * @param  array<int, string>  $colorLabels
     * @return Builder<Product>
     */
    public function scopeWithColorLabels(Builder $query, array $colorLabels): Builder
    {
        if ($colorLabels === []) {
            return $query;
        }

        return $query->whereHas(
            'optionGroups',
            fn (Builder $query) => $query->where('kind', 'color')
                ->whereHas('values', fn (Builder $query) => $query->whereIn('label', $colorLabels)),
        );
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeAvailability(Builder $query, ?string $status): Builder
    {
        if ($status === null || $status === '') {
            return $query;
        }

        return $query->where('stock_status', $status);
    }
}
