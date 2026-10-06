<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCheckoutRequest extends FormRequest
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
            'email' => [$this->user() ? 'nullable' : 'required', 'string', 'email:rfc', 'max:255'],
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_line1' => ['required', 'string', 'max:255'],
            'shipping_line2' => ['nullable', 'string', 'max:255'],
            'shipping_city' => ['required', 'string', 'max:255'],
            'shipping_postal_code' => ['required', 'string', 'max:20'],
            'shipping_country' => ['required', 'string', 'size:2'],
            'shipping_phone' => ['required', 'string', 'max:30'],
            'installation_requested' => ['boolean'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
        ];
    }
}
