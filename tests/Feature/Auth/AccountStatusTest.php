<?php

use App\Enums\UserStatus;
use App\Models\User;

test('a blocked user cannot log in', function () {
    $user = User::factory()->create(['status' => UserStatus::Blocked]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors();
    $this->assertGuest();
});

test('an inactive user cannot log in', function () {
    $user = User::factory()->create(['status' => UserStatus::Inactive]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors();
    $this->assertGuest();
});

test('an active user can log in', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertAuthenticatedAs($user);
});
