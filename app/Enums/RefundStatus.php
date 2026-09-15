<?php

namespace App\Enums;

enum RefundStatus: string
{
    case Requested = 'requested';
    case Processing = 'processing';
    case Refunded = 'refunded';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Requested => 'Refund Requested',
            self::Processing => 'Refund Processing',
            self::Refunded => 'Refunded',
            self::Failed => 'Refund Failed',
        };
    }
}
