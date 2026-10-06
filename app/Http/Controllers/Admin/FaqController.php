<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveFaqRequest;
use App\Http\Requests\Admin\StoreFaqCategoryRequest;
use App\Models\Faq;
use App\Models\FaqCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manages the questions and answers shown on the storefront FAQ page. The
 * storefront reads the same table, so every change here is live immediately.
 */
class FaqController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/faqs/index', [
            'faqs' => Faq::query()->orderBy('sort_order')->orderBy('id')->get(),
            'categories' => FaqCategory::query()->pluck('name')
                ->merge(Faq::query()->whereNotNull('category')->distinct()->pluck('category'))
                ->unique()
                ->sort(SORT_NATURAL | SORT_FLAG_CASE)
                ->values(),
        ]);
    }

    public function store(SaveFaqRequest $request): RedirectResponse
    {
        Faq::query()->create($this->attributes($request, nextOrder: (int) Faq::query()->max('sort_order') + 1));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Question added.']);

        return redirect()->route('admin.faqs.index');
    }

    public function storeCategory(StoreFaqCategoryRequest $request): RedirectResponse
    {
        FaqCategory::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category added.']);

        return redirect()->route('admin.faqs.index');
    }

    /**
     * Removes a category. Its questions are kept and move to General.
     */
    public function destroyCategory(Request $request): RedirectResponse
    {
        $name = $request->validate(['name' => ['required', 'string', 'max:100']])['name'];

        abort_if(mb_strtolower($name) === 'general', 422, 'The General category cannot be deleted.');

        FaqCategory::query()->where('name', $name)->delete();
        Faq::query()->where('category', $name)->update(['category' => null]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted. Its questions moved to General.']);

        return redirect()->route('admin.faqs.index');
    }

    public function update(SaveFaqRequest $request, Faq $faq): RedirectResponse
    {
        $faq->update($this->attributes($request, nextOrder: $faq->sort_order));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Question updated.']);

        return redirect()->route('admin.faqs.index');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Question deleted.']);

        return redirect()->route('admin.faqs.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function attributes(SaveFaqRequest $request, int $nextOrder): array
    {
        return [
            ...$request->safe()->except(['category', 'sort_order']),
            'category' => $request->filled('category') ? trim($request->validated('category')) : null,
            'sort_order' => $request->validated('sort_order') ?? $nextOrder,
        ];
    }
}
