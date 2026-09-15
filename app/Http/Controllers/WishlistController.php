<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('shop/wishlist', [
            'items' => WishlistItem::query()
                ->where('user_id', $request->user()->id)
                ->with('product.category')
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request, Product $product): RedirectResponse
    {
        WishlistItem::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        WishlistItem::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return back();
    }
}
