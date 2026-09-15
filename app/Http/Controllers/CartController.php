<?php

namespace App\Http\Controllers;

use App\Enums\MeasurementUnit;
use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\ReconfigureCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\BlindPricingService;
use App\Services\CartResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(
        private readonly CartResolver $cartResolver,
        private readonly BlindPricingService $pricing,
    ) {}

    public function index(Request $request): Response
    {
        $cart = $this->cartResolver->resolve($request);

        return Inertia::render('shop/cart', [
            'cart' => $cart->load('items.product.optionGroups.values'),
        ]);
    }

    public function store(AddToCartRequest $request): RedirectResponse
    {
        $cart = $this->cartResolver->resolve($request);
        $product = Product::findOrFail((int) $request->validated('product_id'));

        /** @var array<int, int> $optionValueIds */
        $optionValueIds = $request->validated('option_value_ids', []);
        $unit = MeasurementUnit::from($request->validated('unit'));

        $breakdown = $this->pricing->calculate(
            $product,
            (float) $request->validated('width'),
            (float) $request->validated('height'),
            $unit,
            $optionValueIds,
        );

        $quantity = (int) $request->validated('quantity');

        $measurementPhotoPath = $request->hasFile('measurement_photo')
            ? $request->file('measurement_photo')->store('measurements', 'public')
            : null;

        $cart->items()->create([
            'product_id' => $product->id,
            'width_cm' => (int) round($breakdown['width_cm']),
            'height_cm' => (int) round($breakdown['height_cm']),
            'measurement_unit' => $unit->value,
            'quantity' => $quantity,
            'selected_options' => $optionValueIds,
            'measurement_photo_path' => $measurementPhotoPath,
            'price_breakdown' => $breakdown,
            'unit_price' => $breakdown['final_price'],
            'line_total' => round($breakdown['final_price'] * $quantity, 2),
        ]);

        return redirect()->route('cart.index');
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        abort_unless($cartItem->cart_id === $this->cartResolver->resolve($request)->id, 403);

        $quantity = (int) $request->validated('quantity');

        $cartItem->update([
            'quantity' => $quantity,
            'line_total' => round((float) $cartItem->unit_price * $quantity, 2),
        ]);

        return redirect()->route('cart.index');
    }

    public function reconfigure(ReconfigureCartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        abort_unless($cartItem->cart_id === $this->cartResolver->resolve($request)->id, 403);

        /** @var array<int, int> $optionValueIds */
        $optionValueIds = $request->validated('option_value_ids', []);
        $unit = MeasurementUnit::from($request->validated('unit'));

        $breakdown = $this->pricing->calculate(
            $cartItem->product,
            (float) $request->validated('width'),
            (float) $request->validated('height'),
            $unit,
            $optionValueIds,
        );

        $quantity = (int) $request->validated('quantity');

        $measurementPhotoPath = $cartItem->measurement_photo_path;

        if ($request->hasFile('measurement_photo')) {
            if ($measurementPhotoPath) {
                Storage::disk('public')->delete($measurementPhotoPath);
            }

            $measurementPhotoPath = $request->file('measurement_photo')->store('measurements', 'public');
        }

        $cartItem->update([
            'width_cm' => (int) round($breakdown['width_cm']),
            'height_cm' => (int) round($breakdown['height_cm']),
            'measurement_unit' => $unit->value,
            'quantity' => $quantity,
            'selected_options' => $optionValueIds,
            'measurement_photo_path' => $measurementPhotoPath,
            'price_breakdown' => $breakdown,
            'unit_price' => $breakdown['final_price'],
            'line_total' => round($breakdown['final_price'] * $quantity, 2),
        ]);

        return redirect()->route('cart.index');
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        abort_unless($cartItem->cart_id === $this->cartResolver->resolve($request)->id, 403);

        $cartItem->delete();

        return redirect()->route('cart.index');
    }
}
