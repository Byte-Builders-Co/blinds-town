<?php

use App\Enums\ReviewStatus;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests cannot access review moderation', function () {
    $response = $this->get('/admin/reviews');

    $response->assertRedirect(route('login'));
});

test('customers cannot access review moderation', function () {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/reviews');

    $response->assertForbidden();
});

test('new reviews default to pending status', function () {
    $review = ProductReview::factory()->create();

    expect($review->status)->toBe(ReviewStatus::Pending);
});

test('admins can view pending reviews', function () {
    $admin = User::factory()->admin()->create();
    ProductReview::factory()->create();

    $response = $this->actingAs($admin)->get('/admin/reviews');

    $response->assertOk();
});

test('admins can approve a review', function () {
    $admin = User::factory()->admin()->create();
    $review = ProductReview::factory()->create(['status' => ReviewStatus::Pending]);

    $response = $this->actingAs($admin)->patch("/admin/reviews/{$review->id}/status", [
        'status' => 'approved',
    ]);

    $response->assertRedirect();
    expect($review->fresh()->status)->toBe(ReviewStatus::Approved);
    expect($review->fresh()->moderated_by)->toBe($admin->id);
});

test('admins can reject a review', function () {
    $admin = User::factory()->admin()->create();
    $review = ProductReview::factory()->create(['status' => ReviewStatus::Pending]);

    $response = $this->actingAs($admin)->patch("/admin/reviews/{$review->id}/status", [
        'status' => 'rejected',
    ]);

    $response->assertRedirect();
    expect($review->fresh()->status)->toBe(ReviewStatus::Rejected);
});

test('admins can hide a previously approved review', function () {
    $admin = User::factory()->admin()->create();
    $review = ProductReview::factory()->create(['status' => ReviewStatus::Approved]);

    $response = $this->actingAs($admin)->patch("/admin/reviews/{$review->id}/status", [
        'status' => 'hidden',
    ]);

    $response->assertRedirect();
    expect($review->fresh()->status)->toBe(ReviewStatus::Hidden);
});

test('only approved reviews are visible on the public product page', function () {
    $product = Product::factory()->create();
    ProductReview::factory()->for($product)->create(['status' => ReviewStatus::Approved, 'rating' => 5]);
    ProductReview::factory()->for($product)->create(['status' => ReviewStatus::Pending, 'rating' => 1]);
    ProductReview::factory()->for($product)->create(['status' => ReviewStatus::Rejected, 'rating' => 1]);
    ProductReview::factory()->for($product)->create(['status' => ReviewStatus::Hidden, 'rating' => 1]);

    $response = $this->get("/products/{$product->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('reviews.total', 1)
        ->where('product.reviews_count', 1)
        ->where('product.reviews_avg_rating', fn ($value) => (float) $value === 5.0));
});

test('admins can remove an inappropriate image from a review', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();
    $file = UploadedFile::fake()->image('bad.jpg')->store('review-images', 'public');
    $review = ProductReview::factory()->create(['images' => [$file]]);

    $response = $this->actingAs($admin)->delete("/admin/reviews/{$review->id}/images/0");

    $response->assertRedirect();
    expect($review->fresh()->images)->toBe([]);
    Storage::disk('public')->assertMissing($file);
});

test('admins can delete a review', function () {
    $admin = User::factory()->admin()->create();
    $review = ProductReview::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/reviews/{$review->id}");

    $response->assertRedirect(route('admin.reviews.index'));
    $this->assertDatabaseMissing('product_reviews', ['id' => $review->id]);
});
