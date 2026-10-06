<?php

use Database\Seeders\FaqSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds the default FAQs. FaqSeeder skips itself when any FAQ already
     * exists, so FAQs created in the admin are never touched.
     */
    public function up(): void
    {
        // Tests build their own FAQ fixtures on a freshly migrated database.
        if (app()->environment('testing')) {
            return;
        }

        (new FaqSeeder)->run();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Seeded FAQs are regular content and may have been edited; leave them.
    }
};
