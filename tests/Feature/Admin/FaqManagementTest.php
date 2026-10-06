<?php

use App\Models\Faq;
use App\Models\FaqCategory;
use App\Models\User;

beforeEach(function () {
    // Start from an empty list regardless of any default FAQs a migration seeds.
    Faq::query()->delete();
});

test('guests and customers cannot manage faqs', function () {
    $faq = Faq::factory()->create();

    $this->get(route('admin.faqs.index'))->assertRedirect(route('login'));

    $customer = User::factory()->create();
    $this->actingAs($customer)->get(route('admin.faqs.index'))->assertForbidden();
    $this->actingAs($customer)->delete(route('admin.faqs.destroy', $faq))->assertForbidden();
});

test('admins see every question, hidden ones included, in order', function () {
    $admin = User::factory()->admin()->create();
    Faq::factory()->create(['question' => 'Second?', 'sort_order' => 2, 'category' => 'Shipping']);
    Faq::factory()->create(['question' => 'First?', 'sort_order' => 1]);
    Faq::factory()->inactive()->create(['question' => 'Hidden?', 'sort_order' => 3]);

    $this->actingAs($admin)->get(route('admin.faqs.index'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('admin/faqs/index')
        ->has('faqs', 3)
        ->where('faqs.0.question', 'First?')
        ->where('faqs.2.question', 'Hidden?')
        ->where('categories', fn ($categories) => collect($categories)->contains('Shipping')));
});

test('a new question is added to the end and appears on the storefront straight away', function () {
    $admin = User::factory()->admin()->create();
    Faq::factory()->create(['sort_order' => 4]);

    $this->actingAs($admin)->post(route('admin.faqs.store'), [
        'question' => 'Do you fit blinds?',
        'answer' => 'Yes, we offer professional installation.',
        'category' => '  Installation ',
        'is_active' => true,
    ])->assertRedirect(route('admin.faqs.index'));

    $faq = Faq::query()->where('question', 'Do you fit blinds?')->firstOrFail();

    expect($faq->sort_order)->toBe(5)
        ->and($faq->category)->toBe('Installation');

    $this->get('/faq')->assertOk()->assertInertia(fn ($page) => $page
        ->where('faqs', fn ($faqs) => collect($faqs)->pluck('question')->contains('Do you fit blinds?')));
});

test('editing a question changes what the storefront shows', function () {
    $admin = User::factory()->admin()->create();
    $faq = Faq::factory()->create(['question' => 'Old?', 'answer' => 'Old answer', 'sort_order' => 7]);

    $this->actingAs($admin)->put(route('admin.faqs.update', $faq), [
        'question' => 'New?',
        'answer' => 'New answer',
        'category' => '',
        'sort_order' => 2,
        'is_active' => true,
    ])->assertRedirect(route('admin.faqs.index'));

    expect($faq->fresh())
        ->question->toBe('New?')
        ->answer->toBe('New answer')
        ->category->toBeNull()
        ->sort_order->toBe(2);

    $this->get('/faq')->assertInertia(fn ($page) => $page->where('faqs.0.answer', 'New answer'));
});

test('editing without an order keeps the current position', function () {
    $admin = User::factory()->admin()->create();
    $faq = Faq::factory()->create(['sort_order' => 7]);

    $this->actingAs($admin)->put(route('admin.faqs.update', $faq), [
        'question' => 'Same position?',
        'answer' => 'Yes.',
        'is_active' => true,
    ])->assertRedirect();

    expect($faq->fresh()->sort_order)->toBe(7);
});

test('a hidden question disappears from the storefront', function () {
    $admin = User::factory()->admin()->create();
    $faq = Faq::factory()->create();

    $this->actingAs($admin)->put(route('admin.faqs.update', $faq), [
        'question' => $faq->question,
        'answer' => $faq->answer,
        'is_active' => false,
    ])->assertRedirect();

    $this->get('/faq')->assertInertia(fn ($page) => $page->has('faqs', 0));
});

test('deleting removes the question for good', function () {
    $admin = User::factory()->admin()->create();
    $faq = Faq::factory()->create();

    $this->actingAs($admin)->delete(route('admin.faqs.destroy', $faq))->assertRedirect(route('admin.faqs.index'));

    $this->assertModelMissing($faq);
});

test('a question needs both a question and an answer', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.faqs.store'), ['question' => '', 'answer' => ''])
        ->assertSessionHasErrors(['question', 'answer']);

    expect(Faq::query()->count())->toBe(0);
});

test('staff with only content view access can see but not change faqs', function () {
    $staff = User::factory()->staff()->create();
    $staff->givePermissionTo('cms.view');
    $faq = Faq::factory()->create();

    $this->actingAs($staff)->get(route('admin.faqs.index'))->assertOk();
    $this->actingAs($staff)->delete(route('admin.faqs.destroy', $faq))->assertForbidden();
    $this->actingAs($staff)->post(route('admin.faqs.store'), ['question' => 'q', 'answer' => 'a'])->assertForbidden();
});

test('a category can be created before any question uses it', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.faqs.categories.store'), ['name' => '  Shipping '])
        ->assertRedirect(route('admin.faqs.index'));

    expect(FaqCategory::query()->pluck('name')->all())->toBe(['Shipping']);

    $this->actingAs($admin)->get(route('admin.faqs.index'))->assertInertia(fn ($page) => $page
        ->where('categories', fn ($categories) => collect($categories)->contains('Shipping')));
});

test('the category list merges created categories with those used by questions', function () {
    $admin = User::factory()->admin()->create();
    FaqCategory::query()->create(['name' => 'Warranty']);
    Faq::factory()->create(['category' => 'Installation']);
    Faq::factory()->create(['category' => 'Installation']);

    $this->actingAs($admin)->get(route('admin.faqs.index'))->assertInertia(fn ($page) => $page
        ->where('categories', ['Installation', 'Warranty']));
});

test('duplicate or blank category names are rejected', function (string $name) {
    $admin = User::factory()->admin()->create();
    FaqCategory::query()->create(['name' => 'Shipping']);
    Faq::factory()->create(['category' => 'Installation']);

    $this->actingAs($admin)->post(route('admin.faqs.categories.store'), ['name' => $name])
        ->assertSessionHasErrors('name');

    expect(FaqCategory::query()->count())->toBe(1);
})->with(['blank' => [''], 'exists' => ['shipping'], 'used by a question' => ['INSTALLATION'], 'default' => ['General']]);

test('only users who can manage content may create categories', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)->post(route('admin.faqs.categories.store'), ['name' => 'X'])->assertForbidden();
});

test('deleting a category keeps its questions and moves them to General', function () {
    $admin = User::factory()->admin()->create();
    FaqCategory::query()->create(['name' => 'Shipping']);
    $faq = Faq::factory()->create(['category' => 'Shipping']);
    $other = Faq::factory()->create(['category' => 'Installation']);

    $this->actingAs($admin)->delete(route('admin.faqs.categories.destroy'), ['name' => 'Shipping'])
        ->assertRedirect(route('admin.faqs.index'));

    expect(FaqCategory::query()->count())->toBe(0)
        ->and($faq->fresh()->category)->toBeNull()
        ->and($other->fresh()->category)->toBe('Installation');
});

test('the General category cannot be deleted and customers cannot delete categories', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->delete(route('admin.faqs.categories.destroy'), ['name' => 'General'])->assertStatus(422);

    $customer = User::factory()->create();
    $this->actingAs($customer)->delete(route('admin.faqs.categories.destroy'), ['name' => 'Shipping'])->assertForbidden();
});
