<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case MeasurementPending = 'measurement_pending';
    case Manufacturing = 'manufacturing';
    case ReadyToShip = 'ready_to_ship';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::MeasurementPending => 'Measurement Pending',
            self::Manufacturing => 'Manufacturing',
            self::ReadyToShip => 'Ready to Ship',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * The canonical fulfillment sequence, used to render order timelines.
     *
     * @return list<self>
     */
    public static function sequence(): array
    {
        return [
            self::Pending,
            self::Confirmed,
            self::MeasurementPending,
            self::Manufacturing,
            self::ReadyToShip,
            self::Shipped,
            self::Delivered,
        ];
    }

    /**
     * Statuses reached only once an order has been confirmed (i.e. paid or COD-confirmed).
     * Used to gate purchase-only behavior such as product reviews.
     *
     * @return list<self>
     */
    public static function confirmedStatuses(): array
    {
        return array_slice(self::sequence(), 1);
    }
}
