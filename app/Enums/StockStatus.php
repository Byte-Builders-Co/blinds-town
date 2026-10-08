<?php

namespace App\Enums;

enum StockStatus: string
{
    case InStock = 'in_stock';
    case OutOfStock = 'out_of_stock';

    public function label(): string
    {
        return match ($this) {
            self::InStock => 'In Stock',
            self::OutOfStock => 'Out of Stock',
        };
    }
}
