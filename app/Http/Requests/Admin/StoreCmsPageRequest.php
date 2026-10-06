<?php

namespace App\Http\Requests\Admin;

use Illuminate\Support\Str;

class StoreCmsPageRequest extends UpdateCmsPageRequest
{
    protected function prepareForValidation(): void
    {
        // The slug becomes part of the page's public URL, so normalise it.
        $this->merge(['slug' => Str::slug((string) ($this->input('slug') ?: $this->input('title')))]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'slug' => ['required', 'string', 'max:100', 'unique:cms_pages,slug'],
        ];
    }
}
