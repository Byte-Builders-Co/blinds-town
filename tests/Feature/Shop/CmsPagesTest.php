<?php

use App\Enums\AdminAlertType;
use App\Models\CmsPage;
use App\Models\Faq;
use Database\Seeders\FaqSeeder;

test('the about page renders seeded content', function () {
    $response = $this->get('/about');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('shop/cms-page')
        ->where('page.slug', 'about'));
});

test('the privacy policy and terms pages render', function () {
    $this->get('/privacy-policy')->assertOk();
    $this->get('/terms')->assertOk();
});

test('the shipping policy and return & refund policy pages render', function () {
    $this->get('/shipping-policy')->assertOk();
    $this->get('/shipping-policy')->assertInertia(fn ($page) => $page
        ->component('shop/cms-page')
        ->where('page.slug', 'shipping-policy'));

    $this->get('/return-refund-policy')->assertOk();
    $this->get('/return-refund-policy')->assertInertia(fn ($page) => $page
        ->component('shop/cms-page')
        ->where('page.slug', 'return-refund-policy'));
});

test('an inactive static page returns 404', function () {
    CmsPage::query()->where('slug', 'about')->update(['is_active' => false]);

    $response = $this->get('/about');

    $response->assertNotFound();
});

test('the contact page renders business information', function () {
    $response = $this->get('/contact');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('page.sections.business_name', 'Blinds Town'));
});

test('submitting the contact form stores an inquiry and alerts admins', function () {
    $response = $this->post('/contact', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '555-0100',
        'subject' => 'Question about blinds',
        'message' => 'Do you ship internationally?',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('contact_inquiries', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);
    $this->assertDatabaseHas('admin_alerts', [
        'type' => AdminAlertType::ContactInquiry->value,
    ]);
});

test('the contact form requires a name and message', function () {
    $response = $this->post('/contact', ['email' => 'jane@example.com']);

    $response->assertSessionHasErrors(['name', 'message']);
});

test('the faq page only shows active faqs', function () {
    Faq::factory()->create(['question' => 'Visible question?']);
    Faq::factory()->inactive()->create(['question' => 'Hidden question?']);

    $response = $this->get('/faq');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->has('faqs', 1));
});

test('the default faqs are seeded in authored order and never overwrite existing faqs', function () {
    $this->seed(FaqSeeder::class);

    expect(Faq::query()->count())->toBeGreaterThan(30);

    $this->get('/faq')->assertInertia(fn ($page) => $page
        ->where('faqs.0.category', 'General Questions')
        ->where('faqs.0.question', 'What types of blinds do you offer?'));

    $count = Faq::query()->count();
    $this->seed(FaqSeeder::class);

    expect(Faq::query()->count())->toBe($count);
});
