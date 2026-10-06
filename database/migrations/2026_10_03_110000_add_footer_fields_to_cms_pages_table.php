<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The links the footer showed before it became data-driven, in order.
     *
     * @var list<string>
     */
    private array $existingFooterSlugs = ['about', 'privacy-policy', 'terms', 'shipping-policy', 'return-refund-policy'];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            $table->boolean('show_in_footer')->default(false)->after('is_active');
            $table->unsignedInteger('footer_order')->default(0)->after('show_in_footer');
        });

        foreach ($this->existingFooterSlugs as $index => $slug) {
            DB::table('cms_pages')->where('slug', $slug)->update([
                'show_in_footer' => true,
                'footer_order' => $index + 1,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            $table->dropColumn(['show_in_footer', 'footer_order']);
        });
    }
};
