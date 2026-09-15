<?php

namespace App\Services;

use App\Enums\CouponType;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CouponService
{
    /**
     * @param  Collection<int, CartItem>  $cartItems
     */
    public function validate(string $code, User $user, float $subtotal, Collection $cartItems): Coupon
    {
        $coupon = Coupon::query()->with(['products:id', 'categories:id'])
            ->where('code', $code)
            ->where('is_active', true)
            ->first();

        if (! $coupon) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon code is not valid.']);
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon is not active yet.']);
        }

        if ($coupon->ends_at && $coupon->ends_at->isPast()) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon has expired.']);
        }

        if ($coupon->min_order_amount !== null && $subtotal < (float) $coupon->min_order_amount) {
            throw ValidationException::withMessages(['coupon_code' => "This coupon requires a minimum order of {$coupon->min_order_amount}."]);
        }

        if ($coupon->usage_limit !== null && $coupon->usages()->count() >= $coupon->usage_limit) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon has reached its usage limit.']);
        }

        if ($coupon->per_user_limit !== null && $coupon->usages()->where('user_id', $user->id)->count() >= $coupon->per_user_limit) {
            throw ValidationException::withMessages(['coupon_code' => 'You have already used this coupon the maximum number of times.']);
        }

        if ($coupon->hasRestrictions() && $this->eligibleSubtotal($coupon, $cartItems) <= 0.0) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon does not apply to any items in your cart.']);
        }

        return $coupon;
    }

    /**
     * @param  Collection<int, CartItem>  $cartItems
     */
    public function calculateDiscount(Coupon $coupon, Collection $cartItems): float
    {
        $eligibleSubtotal = $this->eligibleSubtotal($coupon, $cartItems);

        $discount = $coupon->type === CouponType::Percentage
            ? $eligibleSubtotal * (float) $coupon->value / 100
            : (float) $coupon->value;

        if ($coupon->max_discount !== null) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        return round(min($discount, $eligibleSubtotal), 2);
    }

    /**
     * @param  Collection<int, CartItem>  $cartItems
     */
    private function eligibleSubtotal(Coupon $coupon, Collection $cartItems): float
    {
        if (! $coupon->hasRestrictions()) {
            return $cartItems->sum(fn (CartItem $item) => $this->itemNetSubtotal($item));
        }

        $productIds = $coupon->products->pluck('id');
        $categoryIds = $coupon->categories->pluck('id');

        return $cartItems
            ->filter(fn (CartItem $item) => $productIds->contains($item->product_id) || $categoryIds->contains($item->product->category_id))
            ->sum(fn (CartItem $item) => $this->itemNetSubtotal($item));
    }

    private function itemNetSubtotal(CartItem $item): float
    {
        $breakdown = $item->price_breakdown ?? [];
        $net = ((float) ($breakdown['subtotal'] ?? 0) - (float) ($breakdown['product_discount'] ?? 0)) * $item->quantity;

        return max(0.0, $net);
    }
}
