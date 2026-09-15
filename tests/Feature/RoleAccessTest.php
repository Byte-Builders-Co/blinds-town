<?php

use App\Models\User;

test('customers cannot access the admin dashboard', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/dashboard');

    $response->assertForbidden();
});

test('admins can access the admin dashboard', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get('/admin/dashboard');

    $response->assertOk();
});

test('login redirects admins to the admin dashboard', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->post(route('login.store'), [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('admin.dashboard'));
});

test('login redirects customers to the shop homepage', function () {
    $customer = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $customer->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('home'));
});

test('admin created via the admin:create command can access the admin dashboard', function () {
    $this->artisan('admin:create', [
        '--name' => 'CLI Admin',
        '--email' => 'cli-admin@example.com',
        '--password' => 'password123',
    ])->assertSuccessful();

    $admin = User::where('email', 'cli-admin@example.com')->firstOrFail();

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
});
