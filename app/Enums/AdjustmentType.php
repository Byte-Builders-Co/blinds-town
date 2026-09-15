<?php

namespace App\Enums;

enum AdjustmentType: string
{
    case Increase = 'increase';
    case Decrease = 'decrease';
    case Correction = 'correction';

    public function label(): string
    {
        return match ($this) {
            self::Increase => 'Increase',
            self::Decrease => 'Decrease',
            self::Correction => 'Correction',
        };
    }
}
