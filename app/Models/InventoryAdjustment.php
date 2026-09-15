<?php

namespace App\Models;

use App\Enums\AdjustmentType;
use Database\Factories\InventoryAdjustmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $adjustable_type
 * @property int $adjustable_id
 * @property AdjustmentType $type
 * @property string $previous_quantity
 * @property string $adjustment
 * @property string $new_quantity
 * @property string $reason
 * @property int $adjusted_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Fabric|Accessory $adjustable
 * @property-read User $adjustedBy
 */
#[Fillable(['adjustable_type', 'adjustable_id', 'type', 'previous_quantity', 'adjustment', 'new_quantity', 'reason', 'adjusted_by'])]
class InventoryAdjustment extends Model
{
    /** @use HasFactory<InventoryAdjustmentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => AdjustmentType::class,
            'previous_quantity' => 'decimal:2',
            'adjustment' => 'decimal:2',
            'new_quantity' => 'decimal:2',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function adjustable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function adjustedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }
}
