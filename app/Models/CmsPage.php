<?php

namespace App\Models;

use Database\Factories\CmsPageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $slug
 * @property string $title
 * @property string|null $content
 * @property array<string, mixed>|null $sections
 * @property bool $is_active
 * @property bool $show_in_footer
 * @property int $footer_order
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $public_url
 */
#[Fillable(['slug', 'title', 'content', 'sections', 'is_active', 'show_in_footer', 'footer_order', 'seo_title', 'seo_description'])]
class CmsPage extends Model
{
    /** @use HasFactory<CmsPageFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'sections' => 'array',
            'is_active' => 'boolean',
            'show_in_footer' => 'boolean',
            'footer_order' => 'integer',
        ];
    }

    /**
     * The pages that predate the page builder keep their original short URLs;
     * every page created in the admin lives under /pages.
     */
    private const LEGACY_SLUGS = ['about', 'privacy-policy', 'terms', 'shipping-policy', 'return-refund-policy'];

    public function getPublicUrlAttribute(): string
    {
        return in_array($this->slug, self::LEGACY_SLUGS, true) ? "/{$this->slug}" : "/pages/{$this->slug}";
    }

    /**
     * Published text pages that are linked from the storefront footer.
     *
     * @param  Builder<CmsPage>  $query
     * @return Builder<CmsPage>
     */
    public function scopeInFooter(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('show_in_footer', true)
            ->whereNull('sections')
            ->orderBy('footer_order')
            ->orderBy('id');
    }
}
