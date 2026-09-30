<?php

use App\Enums\UserStatus;
use App\Models\Order;
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

test('a customer\'s orders are paginated on the show page', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    Order::factory()->count(12)->create(['user_id' => $customer->id]);

    $response = $this->actingAs($admin)->get("/admin/customers/{$customer->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/customers/show')
        ->has('orders.data', 10)
        ->where('orders.total', 12)
    );
});

test('admins can export customers to csv', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create(['first_name' => 'Jane', 'last_name' => 'Doe']);

    $response = $this->actingAs($admin)->get('/admin/customers/export');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    $csv = $response->streamedContent();
    expect($csv)->toContain('ID,"First Name","Last Name",Email,"Mobile Number",Status,"Last Login","Created At"');
    expect($csv)->toContain((string) $customer->id)->toContain('Jane')->toContain('Doe');
});

test('exporting customers respects the search filter', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->create(['first_name' => 'Match']);
    User::factory()->create(['first_name' => 'Other']);

    $response = $this->actingAs($admin)->get('/admin/customers/export?search=Match');

    $csv = $response->streamedContent();
    expect($csv)->toContain('Match');
    expect($csv)->not->toContain('Other');
});

test('customers cannot export the customer list', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/customers/export');

    $response->assertForbidden();
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

test('admins can create a customer', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/customers', [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane.doe@example.com',
        'mobile_number' => '5551234567',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'status' => 'active',
    ]);

    $customer = User::query()->where('email', 'jane.doe@example.com')->firstOrFail();
    $response->assertRedirect(route('admin.customers.show', $customer));
    expect($customer->isCustomer())->toBeTrue();
    expect($customer->email_verified_at)->not->toBeNull();
});

test('creating a customer requires a confirmed password', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/customers', [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane.doe@example.com',
        'password' => 'password123',
        'password_confirmation' => 'not-matching',
        'status' => 'active',
    ]);

    $response->assertSessionHasErrors(['password']);
});

test('admins can update a customer', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create(['first_name' => 'Old']);

    $response = $this->actingAs($admin)->put("/admin/customers/{$customer->id}", [
        'first_name' => 'New',
        'last_name' => $customer->last_name,
        'email' => $customer->email,
        'status' => 'inactive',
    ]);

    $response->assertRedirect(route('admin.customers.show', $customer));
    expect($customer->fresh()->first_name)->toBe('New');
    expect($customer->fresh()->status)->toBe(UserStatus::Inactive);
});

test('admins can soft delete a customer', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/customers/{$customer->id}");

    $response->assertRedirect(route('admin.customers.index'));
    $this->assertSoftDeleted('users', ['id' => $customer->id]);
});

test('a soft deleted customer cannot log in', function () {
    $customer = User::factory()->create();
    $customer->delete();

    $response = $this->post('/login', [
        'email' => $customer->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors();
});

test('staff without users permissions cannot create or delete customers', function () {
    $staff = User::factory()->staff()->create();
    $customer = User::factory()->create();

    $this->actingAs($staff)->get('/admin/customers/create')->assertForbidden();
    $this->actingAs($staff)->delete("/admin/customers/{$customer->id}")->assertForbidden();
});
