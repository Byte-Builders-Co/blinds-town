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
    public function index(): Response
    {
        // The whole taxonomy is small, so the page gets every category at once
        // and builds the parent/child tree, search and filters in the browser.
        return Inertia::render('admin/categories/index', [
            'categories' => Category::query()
                ->withCount(['products', 'children'])
                ->with('parent:id,name')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
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

    public function toggle(Request $request, Category $category): RedirectResponse
    {
        $category->update([
            'is_active' => ! $category->is_active,
            'updated_by' => $request->user()->id,
        ]);

        $state = $category->is_active ? 'Activated' : 'Deactivated';

        ActivityLog::record('updated', $category, "{$state} category \"{$category->name}\"");

        return back();
    }

    /**
     * Copies a category's own details (not its subcategories, products or
     * images). The copy starts inactive so it can be reviewed before it shows.
     */
    public function duplicate(Request $request, Category $category): RedirectResponse
    {
        $name = "{$category->name} (Copy)";

        $copy = Category::query()->create([
            ...$category->only([
                'parent_id',
                'short_description',
                'description',
                'meta_title',
                'meta_description',
                'meta_keywords',
                'sort_order',
                'is_featured',
                'show_in_menu',
            ]),
            'name' => $name,
            'slug' => $this->uniqueSlug($name),
            'is_active' => false,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        ActivityLog::record('created', $copy, "Duplicated category \"{$category->name}\"");

        return back();
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
