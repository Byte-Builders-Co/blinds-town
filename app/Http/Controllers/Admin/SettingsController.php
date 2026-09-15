<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /** @var list<string> */
    private const GROUPS = ['store', 'business', 'tax', 'shipping', 'payment', 'notifications'];

    public function edit(string $group): Response
    {
        abort_unless(in_array($group, self::GROUPS, true), 404);

        return Inertia::render('admin/settings/page', [
            'group' => $group,
            'values' => Setting::group($group),
        ]);
    }

    public function update(Request $request, string $group): RedirectResponse
    {
        abort_unless(in_array($group, self::GROUPS, true), 404);

        $validated = Validator::make($request->all(), $this->rulesFor($group))->validate();

        if ($group === 'store') {
            $validated = $this->handleStoreUploads($request, $validated);
        }

        foreach ($validated as $key => $value) {
            Setting::set("{$group}.{$key}", $value);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Settings updated.']);

        return redirect()->route('admin.settings.edit', $group);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    private function rulesFor(string $group): array
    {
        return match ($group) {
            'store' => [
                'store_name' => ['required', 'string', 'max:255'],
                'store_email' => ['nullable', 'email', 'max:255'],
                'store_phone' => ['nullable', 'string', 'max:50'],
                'store_address' => ['nullable', 'string', 'max:500'],
                'currency' => ['required', 'string', 'size:3'],
                'timezone' => ['required', 'string', 'max:100'],
                'logo' => ['nullable', 'image', 'max:2048'],
                'favicon' => ['nullable', 'image', 'max:512'],
            ],
            'business' => [
                'legal_business_name' => ['nullable', 'string', 'max:255'],
                'business_address' => ['nullable', 'string', 'max:500'],
                'business_phone' => ['nullable', 'string', 'max:50'],
                'business_email' => ['nullable', 'email', 'max:255'],
                'gstin' => ['nullable', 'string', 'max:50'],
                'registration_details' => ['nullable', 'string', 'max:500'],
            ],
            'tax' => [
                'gst_enabled' => ['boolean'],
                'gst_rate' => ['required', 'numeric', 'min:0', 'max:100'],
                'tax_inclusive' => ['boolean'],
            ],
            'shipping' => [
                'shipping_enabled' => ['boolean'],
                'free_shipping_threshold' => ['nullable', 'numeric', 'min:0'],
                'default_shipping_charge' => ['required', 'numeric', 'min:0'],
                'installation_charge' => ['required', 'numeric', 'min:0'],
            ],
            'payment' => [
                'payment_gateway' => ['required', 'string', 'in:stripe'],
                'test_mode' => ['boolean'],
            ],
            'notifications' => [
                'channel_email' => ['boolean'],
                'channel_sms' => ['boolean'],
                'channel_whatsapp' => ['boolean'],
                'event_order_created' => ['boolean'],
                'event_payment_success' => ['boolean'],
                'event_payment_failed' => ['boolean'],
                'event_order_shipped' => ['boolean'],
                'event_order_delivered' => ['boolean'],
                'event_low_stock' => ['boolean'],
            ],
            default => [],
        };
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function handleStoreUploads(Request $request, array $validated): array
    {
        $current = Setting::group('store');

        $logoPath = $current['logo_path'] ?? null;
        $faviconPath = $current['favicon_path'] ?? null;

        if ($request->hasFile('logo')) {
            if ($logoPath) {
                Storage::disk('public')->delete($logoPath);
            }
            $logoPath = $request->file('logo')->store('settings', 'public');
        }

        if ($request->hasFile('favicon')) {
            if ($faviconPath) {
                Storage::disk('public')->delete($faviconPath);
            }
            $faviconPath = $request->file('favicon')->store('settings', 'public');
        }

        unset($validated['logo'], $validated['favicon']);
        $validated['logo_path'] = $logoPath;
        $validated['favicon_path'] = $faviconPath;

        return $validated;
    }
}
