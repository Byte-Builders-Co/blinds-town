<?php

use App\Support\HtmlSanitizer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * CMS page content is now rich-text HTML edited in the admin panel.
     * Existing plain-text/markdown content is converted once so it shows up
     * formatted in the editor. Content that is already HTML is left alone.
     */
    public function up(): void
    {
        DB::table('cms_pages')
            ->whereNull('sections')
            ->whereNotNull('content')
            ->orderBy('id')
            ->each(function (object $page): void {
                $content = trim((string) $page->content);

                if ($content === '' || str_starts_with($content, '<')) {
                    return;
                }

                $html = HtmlSanitizer::clean(Str::markdown($content, ['html_input' => 'strip']));

                DB::table('cms_pages')->where('id', $page->id)->update([
                    'content' => $html,
                    'updated_at' => now(),
                ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // The original markdown is not recoverable from HTML; nothing to undo.
    }
};
