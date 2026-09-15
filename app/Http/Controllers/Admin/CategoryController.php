<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\ActivityLog;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => Category::query()
                ->withCount(['products', 'children'])
                ->with('parent:id,name')
                ->when($request->string('search')->toString(), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
                ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('is_active', $status === 'active'))
                ->when($request->string('parent')->toString(), fn ($q, $parent) => $parent === 'top-level'
                    ? $q->whereNull('parent_id')
                    : $q->where('parent_id', $parent))
                ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
                ->orderBy($this->sortColumn($request))
                ->paginate(15)
                ->withQueryString(),
            'parentOptions' => Category::query()->whereNull('parent_id')->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('search', 'status', 'parent', 'featured', 'sort'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/create', [
            'parentOptions' => $this->parentOptions(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'banner_image']);
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['created_by'] = $request->user()->id;
        $data['updated_by'] = $request->user()->id;

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        if ($request->hasFile('banner_image')) {
            $data['banner_image_path'] = $request->file('banner_image')->store('categories/banners', 'public');
        }

        $category = Category::query()->create($data);

        ActivityLog::record('created', $category, "Created category \"{$category->name}\"");

        return redirect()->route('admin.categories.index');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => $category,
            'parentOptions' => $this->parentOptions($category->id),
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'banner_image']);

        if ($data['name'] !== $category->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $category->id);
        }

        $data['updated_by'] = $request->user()->id;

        if ($request->hasFile('image')) {
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }

            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        if ($request->hasFile('banner_image')) {
            if ($category->banner_image_path) {
                Storage::disk('public')->delete($category->banner_image_path);
            }

            $data['banner_image_path'] = $request->file('banner_image')->store('categories/banners', 'public');
        }

        $category->update($data);

        ActivityLog::record('updated', $category, "Updated category \"{$category->name}\"");

        return redirect()->route('admin.categories.index');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->children()->exists()) {
            return back()->withErrors(['category' => 'This category has subcategories. Move or delete them first.']);
        }

        if ($category->products()->exists()) {
            return back()->withErrors(['category' => 'This category has products assigned to it. Reassign them first.']);
        }

        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        if ($category->banner_image_path) {
            Storage::disk('public')->delete($category->banner_image_path);
        }

        ActivityLog::record('deleted', null, "Deleted category \"{$category->name}\"");

        $category->delete();

        return redirect()->route('admin.categories.index');
    }

    /**
     * @return Collection<int, Category>
     */
    private function parentOptions(?int $excludeId = null): Collection
    {
        return Category::query()
            ->whereNull('parent_id')
            ->when($excludeId, fn ($q, $id) => $q->whereKeyNot($id))
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function sortColumn(Request $request): string
    {
        $allowed = ['name', 'sort_order', 'created_at'];
        $sort = $request->string('sort', 'sort_order')->toString();

        return in_array($sort, $allowed, true) ? $sort : 'sort_order';
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (Category::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-".++$suffix;
        }

        return $slug;
    }
}
