<?php

use App\Enums\UserStatus;
use App\Models\User;

test('customers cannot access admin customer management', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/customers');

    $response->assertForbidden();
});

test('admins can view the customer list', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/admin/customers');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('admin/customers/index'));
});

test('admins can block a customer', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();

    $response = $this->actingAs($admin)->patch("/admin/customers/{$customer->id}/status", [
        'status' => 'blocked',
    ]);

    $response->assertRedirect(route('admin.customers.show', $customer));
    expect($customer->fresh()->status)->toBe(UserStatus::Blocked);
    $this->assertDatabaseHas('activity_logs', ['action' => 'status_changed']);
});
