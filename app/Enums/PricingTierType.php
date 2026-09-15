<?php

namespace App\Enums;

enum PricingTierType: string
{
    case Flat = 'flat';
    case PerSqm = 'per_sqm';
}
