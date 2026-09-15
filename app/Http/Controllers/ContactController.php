<?php

namespace App\Http\Controllers;

use App\Enums\AdminAlertType;
use App\Http\Requests\StoreContactInquiryRequest;
use App\Models\CmsPage;
use App\Models\ContactInquiry;
use App\Services\AdminAlertService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('shop/contact', [
            'page' => CmsPage::query()->where('slug', 'contact')->firstOrFail(),
        ]);
    }

    public function store(StoreContactInquiryRequest $request, AdminAlertService $alerts): RedirectResponse
    {
        $inquiry = ContactInquiry::query()->create($request->validated());

        $alerts->create(
            AdminAlertType::ContactInquiry,
            "New contact inquiry from {$inquiry->name}",
            $inquiry->message,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => "Thanks {$inquiry->name}, we'll be in touch soon."]);

        return back();
    }
}
