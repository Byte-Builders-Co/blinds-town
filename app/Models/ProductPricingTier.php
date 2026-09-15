<?php

namespace App\Models;

use App\Enums\PricingTierType;
use Database\Factories\ProductPricingTierFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property string $min_area_sqm
 * @property string|null $max_area_sqm
 * @property PricingTierType $pricing_type
 * @property string $price
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 */
#[Fillable(['product_id', 'min_area_sqm', 'max_area_sqm', 'pricing_type', 'price', 'sort_order', 'is_active'])]
class ProductPricingTier extends Model
{
    /** @use HasFactory<ProductPricingTierFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'min_area_sqm' => 'decimal:4',
            'max_area_sqm' => 'decimal:4',
            'pricing_type' => PricingTierType::class,
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @param  Builder<ProductPricingTier>  $query
     * @return Builder<ProductPricingTier>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function matches(float $areaSqm): bool
    {
        if ($areaSqm < (float) $this->min_area_sqm) {
            return false;
        }

        return $this->max_area_sqm === null || $areaSqm <= (float) $this->max_area_sqm;
    }

    public function priceForArea(float $areaSqm): float
    {
        return $this->pricing_type === PricingTierType::Flat
            ? (float) $this->price
            : $areaSqm * (float) $this->price;
    }
}
