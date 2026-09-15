<?php

namespace App\Http\Controllers;

use App\Enums\ReviewStatus;
use App\Http\Requests\StoreProductReviewRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProductReviewController extends Controller
{
    public function index(Product $product): JsonResponse
    {
        return response()->json(
            $product->approvedReviews()->with('user:id,first_name,last_name')->latest()->paginate(10),
        );
    }

    public function store(StoreProductReviewRequest $request, Product $product): RedirectResponse
    {
        $images = collect($request->file('images', []))
            ->map(fn ($image) => $image->store('review-images', 'public'))
            ->values()
            ->all();

        $product->reviews()->create([
            'user_id' => $request->user()->id,
            ...$request->safe()->except('images'),
            'images' => $images,
            'status' => ReviewStatus::Pending,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Thanks! Your review has been submitted and is pending approval.']);

        return back();
    }
}
