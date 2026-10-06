<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Seed the default FAQs from database/seeders/content/faqs.md.
     *
     * The file uses "## Category" headings, "### Question" headings, and
     * everything below a question (until the next heading) is its answer.
     * Nothing is seeded if FAQs already exist, so edits are never overwritten.
     */
    public function run(): void
    {
        if (Faq::query()->exists()) {
            return;
        }

        $category = null;
        $question = null;
        $answer = [];
        $order = 0;

        $flush = function () use (&$category, &$question, &$answer, &$order): void {
            if ($question !== null && $category !== null) {
                Faq::query()->create([
                    'question' => $question,
                    'answer' => trim(implode("\n", $answer)),
                    'category' => $category,
                    'sort_order' => ++$order,
                    'is_active' => true,
                ]);
            }

            $question = null;
            $answer = [];
        };

        $lines = preg_split('/\R/', (string) file_get_contents(database_path('seeders/content/faqs.md'))) ?: [];

        foreach ($lines as $line) {
            if (str_starts_with($line, '### ')) {
                $flush();
                $question = trim(substr($line, 4));
            } elseif (str_starts_with($line, '## ')) {
                $flush();
                $category = trim(substr($line, 3));
            } elseif ($question !== null) {
                $answer[] = $line;
            }
        }

        $flush();
    }
}
