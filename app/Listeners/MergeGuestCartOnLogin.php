<?php

namespace App\Listeners;

use App\Models\Cart;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class MergeGuestCartOnLogin
{
    public function __construct(
        private readonly Request $request,
    ) {}

    public function handle(Login $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $token = $this->request->cookie('cart_token');

        if (! $token) {
            return;
        }

        $guestCart = Cart::query()->where('cart_token', $token)->first();

        if (! $guestCart) {
            return;
        }

        $userCart = Cart::query()->firstOrCreate(['user_id' => $event->user->id]);
        $userCart->mergeFrom($guestCart);

        Cookie::queue(Cookie::forget('cart_token'));
    }
}
