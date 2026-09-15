<?php

namespace App\Http\Requests\Admin;

use App\Models\Order;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreRefundRequest extends FormRequest
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
        /** @var Order $order */
        $order = $this->route('order');
        $maxRefundable = $order->payment ? (float) $order->payment->amount : 0;

        return [
            'amount' => ['required', 'numeric', 'min:0.01', "max:{$maxRefundable}"],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
