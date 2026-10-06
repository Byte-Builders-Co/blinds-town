<?php

namespace App\Models;

use Database\Factories\CouponUsageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $coupon_id
 * @property int|null $user_id
 * @property string|null $guest_email
 * @property int $order_id
 * @property string $discount_amount
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Coupon $coupon
 * @property-read User $user
 * @property-read Order $order
 */
#[Fillable(['coupon_id', 'user_id', 'guest_email', 'order_id', 'discount_amount'])]
class CouponUsage extends Model
{
    /** @use HasFactory<CouponUsageFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'discount_amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Coupon, $this>
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
