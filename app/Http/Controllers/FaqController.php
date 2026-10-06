<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('shop/faqs', [
            'faqs' => Faq::query()->active()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }
}
