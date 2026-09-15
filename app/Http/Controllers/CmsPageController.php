<?php

namespace App\Http\Controllers;

use App\Models\CmsPage;
use Inertia\Inertia;
use Inertia\Response;

class CmsPageController extends Controller
{
    public function show(string $slug): Response
    {
        $page = CmsPage::query()->where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('shop/cms-page', [
            'page' => $page,
        ]);
    }
}
