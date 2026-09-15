<?php

namespace App\Models;

use Database\Factories\ProductOptionValueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_option_group_id
 * @property string $label
 * @property string|null $image_path
 * @property string|null $hex_color
 * @property string $price_modifier
 * @property string|null $price_per_sqm
 * @property string|null $instructions
 * @property bool $is_default
 * @property bool $is_active
 * @property int|null $requires_option_value_id
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ProductOptionGroup $optionGroup
 * @property-read ProductOptionValue|null $requiresOptionValue
 */
#[Fillable([
    'product_option_group_id',
    'label',
    'image_path',
    'hex_color',
    'price_modifier',
    'price_per_sqm',
    'instructions',
    'is_default',
    'is_active',
    'requires_option_value_id',
    'sort_order',
])]
class ProductOptionValue extends Model
{
    /** @use HasFactory<ProductOptionValueFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price_modifier' => 'decimal:2',
            'price_per_sqm' => 'decimal:2',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<ProductOptionGroup, $this>
     */
    public function optionGroup(): BelongsTo
    {
        return $this->belongsTo(ProductOptionGroup::class, 'product_option_group_id');
    }

    /**
     * @return BelongsTo<ProductOptionValue, $this>
     */
    public function requiresOptionValue(): BelongsTo
    {
        return $this->belongsTo(ProductOptionValue::class, 'requires_option_value_id');
    }

    /**
     * @param  Builder<ProductOptionValue>  $query
     * @return Builder<ProductOptionValue>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
