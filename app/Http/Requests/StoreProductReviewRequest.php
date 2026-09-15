<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user()) {
            return false;
        }

        /** @var Product $product */
        $product = $this->route('product');

        $alreadyReviewed = ProductReview::query()
            ->where('user_id', $this->user()->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($alreadyReviewed) {
            return false;
        }

        return OrderItem::query()
            ->where('product_id', $product->id)
            ->whereHas('order', fn ($query) => $query->where('user_id', $this->user()->id)
                ->whereIn('status', OrderStatus::confirmedStatuses()))
            ->exists();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['required', 'string', 'max:255'],
            'comment' => ['required', 'string', 'max:2000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'max:5120'],
        ];
    }
}
