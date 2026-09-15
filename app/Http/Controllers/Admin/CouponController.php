<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CouponType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCouponRequest;
use App\Http\Requests\Admin\UpdateCouponRequest;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/coupons/index', [
            'coupons' => Coupon::query()
                ->withCount('usages')
                ->when($request->string('search')->toString(), fn ($query, $search) => $query->where('code', 'like', "%{$search}%"))
                ->when($request->string('type')->toString(), fn ($query, $type) => $query->where('type', $type))
                ->when($request->filled('status'), fn ($query) => $query->where('is_active', $request->string('status')->toString() === 'active'))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only('search', 'type', 'status'),
            'types' => CouponType::cases(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/coupons/create', [
            'products' => Product::query()->orderBy('name')->get(['id', 'name']),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreCouponRequest $request): RedirectResponse
    {
        $coupon = Coupon::query()->create([
            ...$request->safe()->except(['product_ids', 'category_ids']),
            'code' => strtoupper($request->validated('code')),
        ]);

        $coupon->products()->sync($request->validated('product_ids', []));
        $coupon->categories()->sync($request->validated('category_ids', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coupon created.']);

        return redirect()->route('admin.coupons.index');
    }

    public function edit(Coupon $coupon): Response
    {
        return Inertia::render('admin/coupons/edit', [
            'coupon' => $coupon->load(['products:id,name', 'categories:id,name'])->loadCount('usages'),
            'products' => Product::query()->orderBy('name')->get(['id', 'name']),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): RedirectResponse
    {
        $coupon->update([
            ...$request->safe()->except(['product_ids', 'category_ids']),
            'code' => strtoupper($request->validated('code')),
        ]);

        $coupon->products()->sync($request->validated('product_ids', []));
        $coupon->categories()->sync($request->validated('category_ids', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coupon updated.']);

        return redirect()->route('admin.coupons.edit', $coupon);
    }

    public function toggleStatus(Coupon $coupon): RedirectResponse
    {
        $coupon->update(['is_active' => ! $coupon->is_active]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $coupon->is_active ? 'Coupon activated.' : 'Coupon deactivated.',
        ]);

        return back();
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        if ($coupon->usages()->exists()) {
            return back()->withErrors(['coupon' => 'This coupon has been used and cannot be deleted. Deactivate it instead.']);
        }

        $coupon->products()->detach();
        $coupon->categories()->detach();
        $coupon->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coupon deleted.']);

        return redirect()->route('admin.coupons.index');
    }
}
