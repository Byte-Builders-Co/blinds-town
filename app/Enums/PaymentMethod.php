<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Online = 'online';
    case Cod = 'cod';

    public function label(): string
    {
        return match ($this) {
            self::Online => 'Online Payment',
            self::Cod => 'Cash on Delivery',
        };
    }
}
