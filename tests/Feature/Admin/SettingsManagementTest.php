<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests cannot access settings', function () {
    $this->get('/admin/settings/store')->assertRedirect(route('login'));
});

test('customers cannot access settings', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)->get('/admin/settings/store')->assertForbidden();
});

test('an unknown settings group returns 404', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/settings/bogus')->assertNotFound();
});

test('admins can view and update store settings including logo upload', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/settings/store')->assertOk();

    $response = $this->actingAs($admin)->put('/admin/settings/store', [
        'store_name' => 'Blinds Town Co',
        'store_email' => 'hello@blindstown.test',
        'store_phone' => '555-0100',
        'store_address' => '1 Main St',
        'currency' => 'usd',
        'timezone' => 'UTC',
        'logo' => UploadedFile::fake()->image('logo.png'),
    ]);

    $response->assertRedirect(route('admin.settings.edit', 'store'));
    expect(Setting::get('store.store_name'))->toBe('Blinds Town Co');
    $logoPath = Setting::get('store.logo_path');
    expect($logoPath)->not->toBeNull();
    Storage::disk('public')->assertExists($logoPath);
});

test('admins can update tax settings', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->put('/admin/settings/tax', [
        'gst_enabled' => true,
        'gst_rate' => 18,
        'tax_inclusive' => false,
    ]);

    $response->assertRedirect(route('admin.settings.edit', 'tax'));
    expect(Setting::get('tax.gst_rate'))->toBe(18);
});

test('admins can update shipping settings', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->put('/admin/settings/shipping', [
        'shipping_enabled' => true,
        'free_shipping_threshold' => 100,
        'default_shipping_charge' => 10,
        'installation_charge' => 40,
    ]);

    $response->assertRedirect(route('admin.settings.edit', 'shipping'));
    expect(Setting::get('shipping.default_shipping_charge'))->toBe(10);
});

test('admins can update payment settings', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->put('/admin/settings/payment', [
        'payment_gateway' => 'stripe',
        'test_mode' => false,
    ]);

    $response->assertRedirect(route('admin.settings.edit', 'payment'));
    expect(Setting::get('payment.test_mode'))->toBeFalse();
});

test('admins can update notification settings', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->put('/admin/settings/notifications', [
        'channel_email' => true,
        'channel_sms' => true,
        'channel_whatsapp' => false,
        'event_order_created' => true,
        'event_payment_success' => true,
        'event_payment_failed' => true,
        'event_order_shipped' => false,
        'event_order_delivered' => true,
        'event_low_stock' => true,
    ]);

    $response->assertRedirect(route('admin.settings.edit', 'notifications'));
    expect(Setting::get('notifications.channel_sms'))->toBeTrue();
    expect(Setting::get('notifications.event_order_shipped'))->toBeFalse();
});

test('staff without settings permission cannot manage settings', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get('/admin/settings/store')->assertForbidden();
});
