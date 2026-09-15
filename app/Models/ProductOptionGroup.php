<?php

namespace App\Models;

use App\Enums\OptionGroupKind;
use App\Enums\OptionSelectionType;
use Database\Factories\ProductOptionGroupFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property string $name
 * @property OptionGroupKind $kind
 * @property OptionSelectionType $selection_type
 * @property bool $is_required
 * @property bool $is_active
 * @property int|null $requires_option_value_id
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 * @property-read Collection<int, ProductOptionValue> $values
 * @property-read ProductOptionValue|null $requiresOptionValue
 */
#[Fillable(['product_id', 'name', 'kind', 'selection_type', 'is_required', 'is_active', 'requires_option_value_id', 'sort_order'])]
class ProductOptionGroup extends Model
{
    /** @use HasFactory<ProductOptionGroupFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'kind' => OptionGroupKind::class,
            'selection_type' => OptionSelectionType::class,
            'is_required' => 'boolean',
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
     * @return HasMany<ProductOptionValue, $this>
     */
    public function values(): HasMany
    {
        return $this->hasMany(ProductOptionValue::class)->orderBy('sort_order');
    }

    /**
     * @return BelongsTo<ProductOptionValue, $this>
     */
    public function requiresOptionValue(): BelongsTo
    {
        return $this->belongsTo(ProductOptionValue::class, 'requires_option_value_id');
    }

    public function isSingleSelect(): bool
    {
        return $this->selection_type === OptionSelectionType::Single;
    }

    /**
     * @param  Builder<ProductOptionGroup>  $query
     * @return Builder<ProductOptionGroup>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
