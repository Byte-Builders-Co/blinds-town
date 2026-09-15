<?php

namespace App\Notifications\Messages;

class SmsMessage
{
    public function __construct(
        public readonly ?string $to,
        public readonly string $content,
    ) {}
}
