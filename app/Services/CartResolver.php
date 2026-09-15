<?php

namespace App\Services;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class CartResolver
{
    public const COOKIE_NAME = 'cart_token';

    private ?Cart $cart = null;

    public function resolve(Request $request): Cart
    {
        if ($this->cart !== null) {
            return $this->cart;
        }

        if ($request->user()) {
            return $this->cart = Cart::query()->firstOrCreate(['user_id' => $request->user()->id]);
        }

        $token = $request->cookie(self::COOKIE_NAME);
        $cart = $token ? Cart::query()->where('cart_token', $token)->first() : null;

        if (! $cart) {
            $cart = Cart::query()->create(['cart_token' => (string) Str::uuid()]);
            Cookie::queue(self::COOKIE_NAME, $cart->cart_token, 60 * 24 * 30);
        }

        return $this->cart = $cart;
    }
}
