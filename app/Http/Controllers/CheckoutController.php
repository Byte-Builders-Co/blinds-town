<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Requests\CheckoutQuoteRequest;
use App\Http\Requests\StoreCheckoutRequest;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\ProductOptionGroup;
use App\Models\ProductOptionValue;
use App\Models\Setting;
use App\Models\User;
use App\Services\CartResolver;
use App\Services\CouponService;
use App\Services\PaymentService;
use App\Services\Stripe\PaymentGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartResolver $cartResolver,
        private readonly CouponService $coupons,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->cartResolver->resolve($request)->load('items.product.optionGroups.values');

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index');
        }

        return Inertia::render('shop/checkout', [
            'cart' => $cart,
            'addresses' => $request->user()->addresses()->orderByDesc('is_default')->get(),
            'installationCharge' => (float) Setting::get('shipping.installation_charge', 0),
            'shippingCharge' => (float) Setting::get('shipping.default_shipping_charge', 0),
            'freeShippingThreshold' => Setting::get('shipping.free_shipping_threshold') !== null
                ? (float) Setting::get('shipping.free_shipping_threshold')
                : null,
        ]);
    }

    public function quote(CheckoutQuoteRequest $request): JsonResponse
    {
        $cart = $this->cartResolver->resolve($request)->load('items.product');

        abort_if($cart->items->isEmpty(), 422, 'Your cart is empty.');

        try {
            $totals = $this->calculateTotals(
                $cart,
                $request->user(),
                $request->validated('coupon_code'),
                (bool) $request->validated('installation_requested', false),
            );
        } catch (ValidationException $exception) {
            return response()->json(['errors' => $exception->errors()], 422);
        }

        unset($totals['coupon']);

        return response()->json($totals);
    }

    public function store(StoreCheckoutRequest $request, PaymentService $payments): SymfonyResponse
    {
        $cart = $this->cartResolver->resolve($request)->load('items.product.optionGroups.values');

        abort_if($cart->items->isEmpty(), 422, 'Your cart is empty.');

        $installationRequested = (bool) $request->validated('installation_requested', false);
        $totals = $this->calculateTotals($cart, $request->user(), $request->validated('coupon_code'), $installationRequested);

        $order = DB::transaction(function () use ($request, $cart, $totals, $installationRequested) {
            $order = Order::query()->create([
                'user_id' => $request->user()->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => OrderStatus::Pending,
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discountAmount'],
                'coupon_code' => $totals['coupon']?->code,
                'tax_amount' => $totals['taxAmount'],
                'shipping_charge' => $totals['shippingCharge'],
                'installation_requested' => $installationRequested,
                'installation_charge' => $totals['installationCharge'],
                'total' => $totals['total'],
                'currency' => 'usd',
                'shipping_name' => $request->validated('shipping_name'),
                'shipping_line1' => $request->validated('shipping_line1'),
                'shipping_line2' => $request->validated('shipping_line2'),
                'shipping_city' => $request->validated('shipping_city'),
                'shipping_postal_code' => $request->validated('shipping_postal_code'),
                'shipping_country' => $request->validated('shipping_country'),
                'shipping_phone' => $request->validated('shipping_phone'),
            ]);

            $order->statusHistories()->create(['status' => OrderStatus::Pending->value, 'note' => 'Order placed']);

            foreach ($cart->items as $item) {
                /** @var array<int, int> $optionValueIds */
                $optionValueIds = $item->selected_options ?? [];
                $selectedOptionLabels = $item->product->optionGroups
                    ->flatMap(function (ProductOptionGroup $group) use ($optionValueIds) {
                        return $group->values
                            ->filter(fn (ProductOptionValue $value) => in_array($value->id, $optionValueIds, true))
                            ->map(fn (ProductOptionValue $value) => ['group' => $group->name, 'label' => $value->label]);
                    })
                    ->values()
                    ->all();

                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'width_cm' => $item->width_cm,
                    'height_cm' => $item->height_cm,
                    'measurement_unit' => $item->measurement_unit,
                    'quantity' => $item->quantity,
                    'selected_options' => $selectedOptionLabels,
                    'measurement_photo_path' => $item->measurement_photo_path,
                    'price_breakdown' => $item->price_breakdown,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total,
                ]);
            }

            if ($totals['coupon']) {
                $totals['coupon']->usages()->create([
                    'user_id' => $request->user()->id,
                    'order_id' => $order->id,
                    'discount_amount' => $totals['couponDiscount'],
                ]);
            }

            return $order;
        });

        $payments->createPending($order, PaymentMethod::Online);

        return redirect()->route('checkout.pay', $order);
    }

    /**
     * Show the embedded Stripe Payment Element for a pending order, creating
     * (or reusing) its PaymentIntent. Reusing an existing, still-payable
     * PaymentIntent here is what prevents duplicate charges when the customer
     * refreshes the page or clicks Pay more than once.
     */
    public function pay(Request $request, Order $order, PaymentService $payments): Response|RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        abort_unless($order->status === OrderStatus::Pending, 422, 'This order can no longer be paid for.');

        $payment = $order->payment;
        abort_if(! $payment || $payment->method !== PaymentMethod::Online, 404);
        abort_if($payment->status === PaymentStatus::Paid, 422, 'This order has already been paid.');

        $gateway = app(PaymentGateway::class);

        if ($payment->gateway_transaction_id) {
            $intent = $gateway->retrievePaymentIntent($payment->gateway_transaction_id);

            if ($intent['status'] === 'succeeded') {
                $payments->confirmSucceeded($payment, $intent['id']);

                return redirect()->route('checkout.success', $order);
            }

            if (in_array($intent['status'], ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing'], true)) {
                return Inertia::render('shop/checkout-pay', [
                    'order' => $order->load('items'),
                    'clientSecret' => $intent['client_secret'],
                    'stripePublishableKey' => config('services.stripe.key'),
                ]);
            }
        }

        $intent = $gateway->createPaymentIntent(
            amount: (int) round((float) $order->total * 100),
            currency: $order->currency,
            customerEmail: $request->user()->email,
            metadata: ['order_id' => (string) $order->id, 'order_number' => $order->order_number],
        );

        $payment->update([
            'gateway_transaction_id' => $intent['id'],
            'status' => PaymentStatus::Pending,
            'failure_reason' => null,
        ]);

        return Inertia::render('shop/checkout-pay', [
            'order' => $order->load('items'),
            'clientSecret' => $intent['client_secret'],
            'stripePublishableKey' => config('services.stripe.key'),
        ]);
    }

    public function retryPayment(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        abort_unless($order->status === OrderStatus::Pending, 422, 'This order can no longer be paid for.');

        $payment = $order->payment;
        abort_if(! $payment || $payment->status === PaymentStatus::Paid, 422, 'This order has already been paid.');

        return redirect()->route('checkout.pay', $order);
    }

    public function success(Request $request, Order $order, PaymentService $payments): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $payment = $order->payment;

        if ($payment && $payment->method === PaymentMethod::Online && $payment->status === PaymentStatus::Pending && $payment->gateway_transaction_id) {
            $intent = app(PaymentGateway::class)->retrievePaymentIntent($payment->gateway_transaction_id);

            if ($intent['status'] === 'succeeded') {
                $payments->confirmSucceeded($payment, $intent['id']);
            }
        }

        if ($order->fresh()->status === OrderStatus::Confirmed) {
            $this->cartResolver->resolve($request)->items()->delete();
        }

        return Inertia::render('shop/checkout-success', [
            'order' => $order->fresh(['items', 'payment']),
        ]);
    }

    public function cancel(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        return Inertia::render('shop/checkout-cancel', [
            'order' => $order->load('payment'),
        ]);
    }

    /**
     * @return array{subtotal: float, discountAmount: float, taxAmount: float, shippingCharge: float, installationCharge: float, total: float, coupon: ?Coupon, couponDiscount: float}
     */
    private function calculateTotals(Cart $cart, User $user, ?string $couponCode, bool $installationRequested): array
    {
        $itemSubtotal = 0.0;
        $itemProductDiscount = 0.0;
        $itemTax = 0.0;

        foreach ($cart->items as $item) {
            $breakdown = $item->price_breakdown ?? [];
            $itemSubtotal += ((float) ($breakdown['subtotal'] ?? 0)) * $item->quantity;
            $itemProductDiscount += ((float) ($breakdown['product_discount'] ?? 0)) * $item->quantity;
            $itemTax += ((float) ($breakdown['tax_amount'] ?? 0)) * $item->quantity;
        }

        $subtotal = round($itemSubtotal, 2);
        $productDiscount = round($itemProductDiscount, 2);
        $taxAmount = round($itemTax, 2);

        $coupon = null;
        $couponDiscount = 0.0;

        if ($couponCode !== null && $couponCode !== '') {
            $coupon = $this->coupons->validate($couponCode, $user, $subtotal - $productDiscount, $cart->items);
            $couponDiscount = $this->coupons->calculateDiscount($coupon, $cart->items);
        }

        $discountAmount = round($productDiscount + $couponDiscount, 2);
        $shippingCharge = $this->shippingCharge($subtotal - $discountAmount);
        $installationCharge = $installationRequested ? round((float) Setting::get('shipping.installation_charge', 0), 2) : 0.0;

        $total = max(0.0, round($subtotal - $discountAmount + $shippingCharge + $installationCharge + $taxAmount, 2));

        return [
            'subtotal' => $subtotal,
            'discountAmount' => $discountAmount,
            'taxAmount' => $taxAmount,
            'shippingCharge' => $shippingCharge,
            'installationCharge' => $installationCharge,
            'total' => $total,
            'coupon' => $coupon,
            'couponDiscount' => $couponDiscount,
        ];
    }

    private function shippingCharge(float $netSubtotal): float
    {
        if (! Setting::get('shipping.shipping_enabled', true)) {
            return 0.0;
        }

        $threshold = Setting::get('shipping.free_shipping_threshold');

        if ($threshold !== null && $netSubtotal >= (float) $threshold) {
            return 0.0;
        }

        return round((float) Setting::get('shipping.default_shipping_charge', 0), 2);
    }
}
