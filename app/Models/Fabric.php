<?php

namespace App\Models;

use Database\Factories\FabricFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $sku
 * @property string|null $color
 * @property int $unit_id
 * @property string $available_quantity
 * @property string $reserved_quantity
 * @property string $minimum_stock
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Unit $unit
 * @property-read bool $is_low_stock
 */
#[Fillable(['name', 'sku', 'color', 'unit_id', 'available_quantity', 'reserved_quantity', 'minimum_stock', 'is_active'])]
class Fabric extends Model
{
    /** @use HasFactory<FabricFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $appends = ['is_low_stock'];

    protected function casts(): array
    {
        return [
            'available_quantity' => 'decimal:2',
            'reserved_quantity' => 'decimal:2',
            'minimum_stock' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
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
        return (float) $this->available_quantity <= (float) $this->minimum_stock;
    }

    /**
     * @param  Builder<Fabric>  $query
     * @return Builder<Fabric>
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('available_quantity', '<=', 'minimum_stock');
    }

    /**
     * @param  Builder<Fabric>  $query
     * @return Builder<Fabric>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || trim($term) === '') {
            return $query;
        }

        return $query->where(function (Builder $query) use ($term) {
            $query->where('name', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%")
                ->orWhere('color', 'like', "%{$term}%");
        });
    }
}
