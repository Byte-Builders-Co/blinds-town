<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'exists:categories,slug'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'gte:min_price'],
            'color' => ['nullable', 'array'],
            'color.*' => ['string', 'max:255'],
            'availability' => ['nullable', 'string', 'in:in_stock,out_of_stock'],
            'sort' => ['nullable', 'string', 'in:featured,newest,price_low,price_high,name_asc,name_desc,popular,rating'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ];
    }
}
