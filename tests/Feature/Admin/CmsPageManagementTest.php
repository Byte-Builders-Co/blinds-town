<?php

use App\Models\CmsPage;
use App\Models\User;
use App\Support\HtmlSanitizer;

/**
 * CMS pages for some slugs already exist on a freshly migrated database.
 *
 * @param  array<string, mixed>  $attributes
 */
function cmsPage(string $slug, array $attributes = []): CmsPage
{
    return CmsPage::query()->updateOrCreate(['slug' => $slug], [
        'title' => ucfirst($slug),
        'content' => null,
        'sections' => null,
        'is_active' => true,
        ...$attributes,
    ]);
}

test('the sanitizer keeps formatting and strips scripts, handlers and unsafe links', function () {
    $clean = HtmlSanitizer::clean(
        '<h2 onclick="x()">Title</h2><p>Hi <strong>there</strong><script>alert(1)</script></p>'
        .'<a href="javascript:alert(1)">bad</a> <a href="https://example.com">ok</a>'
        .'<img src=x onerror=alert(1)><iframe src="//evil"></iframe><u>under</u>'
    );

    expect($clean)
        ->toContain('<h2>Title</h2>')
        ->toContain('<strong>there</strong>')
        ->toContain('href="https://example.com"')
        ->toContain('rel="noopener noreferrer"')
        ->not->toContain('script')
        ->not->toContain('onclick')
        ->not->toContain('javascript:')
        ->not->toContain('<img')
        ->not->toContain('iframe')
        ->not->toContain('alert(1)</');

    expect(HtmlSanitizer::clean('   '))->toBeNull();
    expect(HtmlSanitizer::clean(null))->toBeNull();
});

test('admins can list and edit content pages but not the section based pages or About Us', function () {
    $admin = User::factory()->admin()->create();
    $page = cmsPage('terms', ['title' => 'Terms']);
    $about = cmsPage('about', ['title' => 'About Us']);
    cmsPage('contact', ['title' => 'Contact Us', 'sections' => ['email' => 'a@b.test']]);

    $this->actingAs($admin)->get(route('admin.cms-pages.index'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('admin/cms-pages/index')
            ->where('pages', fn ($pages) => collect($pages)->pluck('slug')->contains('terms')
                && ! collect($pages)->pluck('slug')->contains('contact')
                && ! collect($pages)->pluck('slug')->contains('about')));

    $this->actingAs($admin)->get(route('admin.cms-pages.edit', $page))->assertOk();

    $this->actingAs($admin)->get('/admin/cms-pages/contact/edit')->assertNotFound();
    $this->actingAs($admin)->get(route('admin.cms-pages.edit', $about))->assertNotFound();
    $this->actingAs($admin)->put(route('admin.cms-pages.update', $about), ['title' => 'x', 'content' => '<p>x</p>', 'is_active' => true])->assertNotFound();
});

test('saving a content page stores sanitised html', function () {
    $admin = User::factory()->admin()->create();
    $page = cmsPage('terms');

    $this->actingAs($admin)->put(route('admin.cms-pages.update', $page), [
        'title' => 'Terms & Conditions',
        'content' => '<h2>Heading</h2><p>Body <b onmouseover="x()">bold</b></p><script>alert(1)</script>',
        'is_active' => true,
    ])->assertRedirect(route('admin.cms-pages.edit', $page));

    $page->refresh();

    expect($page->title)->toBe('Terms & Conditions');
    expect($page->content)->toContain('<h2>Heading</h2>')->not->toContain('script')->not->toContain('onmouseover');
});

test('the storefront renders the saved html and a published flag controls visibility', function () {
    $page = cmsPage('about', ['content' => '<p>Hello world</p>']);

    $this->get('/about')->assertOk()->assertInertia(fn ($p) => $p->where('page.content', '<p>Hello world</p>'));

    $page->update(['is_active' => false]);

    $this->get('/about')->assertNotFound();
});

test('customers cannot manage content pages', function () {
    $customer = User::factory()->create();
    $page = cmsPage('about');

    $this->actingAs($customer)->get(route('admin.cms-pages.index'))->assertForbidden();
    $this->actingAs($customer)->put(route('admin.cms-pages.update', $page), ['title' => 'x'])->assertForbidden();
});

test('admins can delete a content page but not About Us or section pages', function () {
    $admin = User::factory()->admin()->create();
    $page = cmsPage('terms');
    $about = cmsPage('about');
    $contact = cmsPage('contact', ['sections' => ['email' => 'a@b.test']]);

    $this->actingAs($admin)->delete(route('admin.cms-pages.destroy', $page))
        ->assertRedirect(route('admin.cms-pages.index'));

    $this->assertModelMissing($page);
    $this->actingAs($admin)->delete(route('admin.cms-pages.destroy', $about))->assertNotFound();
    $this->actingAs($admin)->delete(route('admin.cms-pages.destroy', $contact))->assertNotFound();
    $this->get('/terms')->assertNotFound();
});

test('customers cannot delete content pages', function () {
    $customer = User::factory()->create();
    $page = cmsPage('terms');

    $this->actingAs($customer)->delete(route('admin.cms-pages.destroy', $page))->assertForbidden();
    $this->assertModelExists($page);
});

test('admins can add a page; it is sanitised, gets a /pages url and is linked from the footer', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.cms-pages.store'), [
        'title' => 'Care Guide',
        'slug' => 'Care Guide!',
        'content' => '<h2>Care</h2><script>alert(1)</script>',
        'is_active' => true,
        'show_in_footer' => true,
    ])->assertRedirect(route('admin.cms-pages.index'));

    $page = CmsPage::query()->where('slug', 'care-guide')->firstOrFail();

    expect($page->content)->toContain('<h2>Care</h2>')->not->toContain('script')
        ->and($page->public_url)->toBe('/pages/care-guide')
        ->and($page->footer_order)->toBe(6);

    $this->get('/pages/care-guide')->assertOk()->assertInertia(fn ($p) => $p->where('page.title', 'Care Guide'));

    $this->get('/')->assertInertia(fn ($p) => $p->where('footerPages', fn ($links) => collect($links)->contains(['title' => 'Care Guide', 'url' => '/pages/care-guide'])));
});

test('the slug defaults to the title and must be unique', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.cms-pages.store'), ['title' => 'Warranty Info', 'is_active' => true])
        ->assertRedirect();

    expect(CmsPage::query()->where('slug', 'warranty-info')->exists())->toBeTrue();

    $this->actingAs($admin)->post(route('admin.cms-pages.store'), ['title' => 'Again', 'slug' => 'warranty-info'])
        ->assertSessionHasErrors('slug');

    $this->actingAs($admin)->post(route('admin.cms-pages.store'), ['title' => 'Terms', 'slug' => 'terms'])
        ->assertSessionHasErrors('slug');
});

test('the footer lists the built-in pages in order and follows the admin', function () {
    $admin = User::factory()->admin()->create();

    $titles = fn () => collect($this->get('/')->inertiaProps('footerPages'))->pluck('title')->all();

    expect($titles())->toBe(['About Us', 'Privacy Policy', 'Terms & Conditions', 'Shipping Policy', 'Return & Refund Policy']);

    $page = cmsPage('care-guide', ['title' => 'Care Guide', 'show_in_footer' => true, 'footer_order' => 2]);
    expect($titles())->toBe(['About Us', 'Privacy Policy', 'Care Guide', 'Terms & Conditions', 'Shipping Policy', 'Return & Refund Policy']);

    // Hiding the page, or unticking the footer option, removes the link...
    $this->actingAs($admin)->put(route('admin.cms-pages.update', $page), ['title' => 'Care Guide', 'content' => '<p>x</p>', 'is_active' => false, 'show_in_footer' => true])->assertRedirect();
    expect($titles())->not->toContain('Care Guide');

    $this->actingAs($admin)->put(route('admin.cms-pages.update', $page), ['title' => 'Care Guide', 'content' => '<p>x</p>', 'is_active' => true, 'show_in_footer' => false])->assertRedirect();
    expect($titles())->not->toContain('Care Guide');

    // ...as does deleting a page.
    $this->actingAs($admin)->delete(route('admin.cms-pages.destroy', cmsPage('terms')))->assertRedirect();
    expect($titles())->not->toContain('Terms & Conditions');
});

test('section based pages never appear in the footer', function () {
    cmsPage('contact', ['title' => 'Contact Us', 'sections' => ['email' => 'a@b.test'], 'show_in_footer' => true]);

    expect(collect($this->get('/')->inertiaProps('footerPages'))->pluck('title'))->not->toContain('Contact Us');
});

test('only users who can manage content may add pages', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)->get(route('admin.cms-pages.create'))->assertForbidden();
    $this->actingAs($customer)->post(route('admin.cms-pages.store'), ['title' => 'X'])->assertForbidden();
});
