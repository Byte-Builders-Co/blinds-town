<?php

test('guests can open the appearance settings page', function () {
    $this->get('/settings/appearance')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/appearance'));
});

test('the settings url sends guests to appearance', function () {
    $this->get('/settings')->assertRedirect('/settings/appearance');
});

test('guests are still sent to login for the security settings', function () {
    $this->get('/settings/security')->assertRedirect(route('login'));
});
