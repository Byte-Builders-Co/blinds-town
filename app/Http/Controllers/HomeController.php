<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\CmsBanner;
use App\Models\CmsPage;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('welcome', [
            'categories' => Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
                ->orderBy('sort_order')
                ->get(),
            'featuredCategories' => Category::query()
                ->where('is_active', true)
                ->where('is_featured', true)
                ->orderBy('sort_order')
                ->take(6)
                ->get(),
            'featuredProducts' => Product::query()
                ->where('is_active', true)
                ->where('is_featured', true)
                ->with(['category', 'optionGroups.values'])
                ->withCount('approvedReviews as reviews_count')
                ->withAvg('approvedReviews as reviews_avg_rating', 'rating')
                ->latest()
                ->take(8)
                ->get(),
            'banners' => CmsBanner::query()->current()->orderBy('sort_order')->get(),
            'page' => CmsPage::query()->where('slug', 'home')->where('is_active', true)->first(),
        ]);
    }
}
