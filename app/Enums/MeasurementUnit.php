<?php

namespace App\Enums;

enum MeasurementUnit: string
{
    case Cm = 'cm';
    case Inch = 'inch';

    public function toCm(float $value): float
    {
        return $this === self::Inch ? $value * 2.54 : $value;
    }
}
