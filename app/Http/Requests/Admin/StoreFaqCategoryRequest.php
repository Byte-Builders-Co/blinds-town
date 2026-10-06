<?php

namespace App\Http\Requests\Admin;

use App\Models\Faq;
use App\Models\FaqCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFaqCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => trim((string) $this->input('name'))]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $name = mb_strtolower((string) $value);

                    $exists = $name === 'general'
                        || FaqCategory::query()->whereRaw('lower(name) = ?', [$name])->exists()
                        || Faq::query()->whereRaw('lower(category) = ?', [$name])->exists();

                    if ($exists) {
                        $fail('This category already exists.');
                    }
                },
            ],
        ];
    }
}
