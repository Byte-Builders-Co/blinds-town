<?php

namespace App\Http\Requests;

use App\Concerns\ValidatesBlindConfiguration;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AddToCartRequest extends FormRequest
{
    use ValidatesBlindConfiguration;

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
            'product_id' => ['required', 'exists:products,id'],
            'width' => ['required', 'numeric', 'min:0.1'],
            'height' => ['required', 'numeric', 'min:0.1'],
            'unit' => ['required', 'string', 'in:cm,inch'],
            'quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'option_value_ids' => ['array'],
            'option_value_ids.*' => ['integer', 'exists:product_option_values,id'],
            'measurement_photo' => ['nullable', 'image', 'max:4096'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $product = Product::query()->find((int) $this->input('product_id'));

            if (! $product) {
                return;
            }

            $this->validateBlindConfiguration(
                $validator,
                $product,
                (string) $this->input('width'),
                (string) $this->input('height'),
                (string) $this->input('unit'),
                $this->input('option_value_ids', []),
            );
        });
    }
}
