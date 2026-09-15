<?php

namespace App\Models;

use Database\Factories\AccessoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $sku
 * @property string $stock
 * @property string $reserved_quantity
 * @property string $minimum_stock
 * @property string $price
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read bool $is_low_stock
 */
#[Fillable(['name', 'sku', 'stock', 'reserved_quantity', 'minimum_stock', 'price', 'is_active'])]
class Accessory extends Model
{
    /** @use HasFactory<AccessoryFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $appends = ['is_low_stock'];

    protected function casts(): array
    {
        return [
            'stock' => 'decimal:2',
            'reserved_quantity' => 'decimal:2',
            'minimum_stock' => 'decimal:2',
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return MorphMany<InventoryAdjustment, $this>
     */
    public function adjustments(): MorphMany
    {
        return $this->morphMany(InventoryAdjustment::class, 'adjustable')->latest();
    }

    public function getIsLowStockAttribute(): bool
    {
        return (float) $this->stock <= (float) $this->minimum_stock;
    }

    /**
     * @param  Builder<Accessory>  $query
     * @return Builder<Accessory>
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock', '<=', 'minimum_stock');
    }

    /**
     * @param  Builder<Accessory>  $query
     * @return Builder<Accessory>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || trim($term) === '') {
            return $query;
        }

        return $query->where(function (Builder $query) use ($term) {
            $query->where('name', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%");
        });
    }
}
