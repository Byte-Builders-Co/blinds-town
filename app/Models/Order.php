<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $order_number
 * @property OrderStatus $status
 * @property string $subtotal
 * @property string $discount_amount
 * @property string|null $coupon_code
 * @property string $tax_amount
 * @property string $shipping_charge
 * @property bool $installation_requested
 * @property string $installation_charge
 * @property string $total
 * @property string $currency
 * @property string $shipping_name
 * @property string $shipping_line1
 * @property string|null $shipping_line2
 * @property string $shipping_city
 * @property string $shipping_postal_code
 * @property string $shipping_country
 * @property string $shipping_phone
 * @property string|null $carrier
 * @property string|null $tracking_number
 * @property Carbon|null $shipped_at
 * @property Carbon|null $delivered_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Collection<int, OrderItem> $items
 * @property-read Payment|null $payment
 * @property-read Collection<int, OrderStatusHistory> $statusHistories
 */
#[Fillable([
    'user_id',
    'order_number',
    'status',
    'subtotal',
    'discount_amount',
    'coupon_code',
    'tax_amount',
    'shipping_charge',
    'installation_requested',
    'installation_charge',
    'total',
    'currency',
    'shipping_name',
    'shipping_line1',
    'shipping_line2',
    'shipping_city',
    'shipping_postal_code',
    'shipping_country',
    'shipping_phone',
    'carrier',
    'tracking_number',
    'shipped_at',
    'delivered_at',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'shipping_charge' => 'decimal:2',
            'installation_requested' => 'boolean',
            'installation_charge' => 'decimal:2',
            'total' => 'decimal:2',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasOne<Payment, $this>
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * @return HasMany<OrderStatusHistory, $this>
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->oldest();
    }

    public function recordStatus(OrderStatus $status, ?string $note = null): void
    {
        $this->update(['status' => $status]);
        $this->statusHistories()->create(['status' => $status->value, 'note' => $note]);
    }

    public static function generateOrderNumber(): string
    {
        return 'BT-'.now()->format('Ymd').'-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
    }
}
