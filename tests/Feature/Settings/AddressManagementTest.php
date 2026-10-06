<?php

use App\Models\Address;
use App\Models\User;

function addressPayload(array $overrides = []): array
{
    return array_merge([
        'full_name' => 'Jane Doe',
        'mobile_number' => '555-0100',
        'address_line1' => '123 Main St',
        'address_line2' => null,
        'city' => 'Springfield',
        'state' => 'IL',
        'country' => 'US',
        'pincode' => '62704',
        'landmark' => null,
        'type' => 'home',
        'is_default' => false,
    ], $overrides);
}

test('a customer can add an address', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/account/addresses', addressPayload());

    $response->assertRedirect(route('addresses.index'));
    $this->assertDatabaseHas('addresses', ['user_id' => $user->id, 'full_name' => 'Jane Doe']);
});

test('setting a new address as default unsets the previous default', function () {
    $user = User::factory()->create();
    $first = Address::factory()->for($user)->default()->create();

    $response = $this->actingAs($user)->post('/account/addresses', addressPayload(['is_default' => true]));

    $response->assertRedirect(route('addresses.index'));
    expect($first->fresh()->is_default)->toBeFalse();
    expect(Address::where('user_id', $user->id)->where('is_default', true)->count())->toBe(1);
});

test('a customer can update their own address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->for($user)->create(['city' => 'Old City']);

    $response = $this->actingAs($user)->put("/account/addresses/{$address->id}", addressPayload(['city' => 'New City']));

    $response->assertRedirect(route('addresses.index'));
    expect($address->fresh()->city)->toBe('New City');
});

test('a customer cannot update another customers address', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $address = Address::factory()->for($owner)->create();

    $response = $this->actingAs($intruder)->put("/account/addresses/{$address->id}", addressPayload());

    $response->assertForbidden();
});

test('a customer can delete their own address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete("/account/addresses/{$address->id}");

    $response->assertRedirect(route('addresses.index'));
    $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
});

test('a customer cannot delete another customers address', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $address = Address::factory()->for($owner)->create();

    $response = $this->actingAs($intruder)->delete("/account/addresses/{$address->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('addresses', ['id' => $address->id]);
});
