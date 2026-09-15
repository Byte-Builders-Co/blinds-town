<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateReviewStatusRequest;
use App\Models\ProductReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/reviews/index', [
            'reviews' => ProductReview::query()
                ->with(['user:id,first_name,last_name', 'product:id,name'])
                ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
                ->when($request->filled('rating'), fn ($query) => $query->where('rating', $request->integer('rating')))
                ->when($request->string('search')->toString(), fn ($query, $search) => $query->where(fn ($q) => $q
                    ->where('title', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($q) => $q->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"))
                    ->orWhereHas('product', fn ($q) => $q->where('name', 'like', "%{$search}%"))))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only('search', 'status', 'rating'),
            'statuses' => ReviewStatus::cases(),
        ]);
    }

    public function updateStatus(UpdateReviewStatusRequest $request, ProductReview $review): RedirectResponse
    {
        $review->update([
            'status' => $request->validated('status'),
            'moderated_by' => $request->user()->id,
            'moderated_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Review marked as {$review->status->label()}."]);

        return back();
    }

    public function removeImage(Request $request, ProductReview $review, int $index): RedirectResponse
    {
        $images = $review->images ?? [];

        if (isset($images[$index])) {
            Storage::disk('public')->delete($images[$index]);
            unset($images[$index]);
            $review->update(['images' => array_values($images)]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Image removed.']);

        return back();
    }

    public function destroy(ProductReview $review): RedirectResponse
    {
        foreach ($review->images ?? [] as $image) {
            Storage::disk('public')->delete($image);
        }

        $review->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review deleted.']);

        return redirect()->route('admin.reviews.index');
    }
}
