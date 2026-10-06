<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CmsPage::query()->firstOrCreate(['slug' => 'home'], [
            'title' => 'Homepage',
            'is_active' => true,
            'sections' => [
                'hero' => [
                    'heading' => "Made-to-measure blinds,\ncut precisely to your window.",
                    'subheading' => "Enter your window's width and height, pick your finish, and we'll cut it to size. Free shipping on every order.",
                    'cta_text' => 'Shop blinds',
                    'cta_url' => '#categories',
                    'secondary_cta_text' => 'Custom Blind',
                    'secondary_cta_url' => '#',
                    'image_path' => 'HomePage/Hero.png',
                ],
                'promo' => [
                    'eyebrow' => 'Fully Customizable',
                    'heading' => "Your Window. Your Measurements.\nYour Style.",
                    'subheading' => 'Get the perfect fit with our easy customization process.',
                    'button_text' => 'Start Customizing',
                    'button_url' => '/products',
                    'image_path' => 'HomePage/Customize.png',
                ],
                'about' => [
                    'heading' => 'Why choose Blinds Town',
                    'body' => "Made to your exact measurements — enter your window's width and height and we cut every blind to size.\n\nColours, finishes & controls — choose from a range of fabrics, colours, mount types and cordless or motorised control.\n\nFree shipping, every order — no minimums, no surprises.\n\nBuilt to last — quality materials and craftsmanship backed by our satisfaction guarantee.",
                    'image_path' => 'HomePage/Whychoose.jpg',
                ],
            ],
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'about'], [
            'show_in_footer' => true,
            'footer_order' => 1,
            'title' => 'About Us',
            'is_active' => true,
            'seo_title' => 'About Us — Blinds Town',
            'seo_description' => 'Learn about Blinds Town and our made-to-measure blinds.',
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'privacy-policy'], [
            'show_in_footer' => true,
            'footer_order' => 2,
            'title' => 'Privacy Policy',
            'is_active' => true,
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'terms'], [
            'show_in_footer' => true,
            'footer_order' => 3,
            'title' => 'Terms & Conditions',
            'is_active' => true,
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'shipping-policy'], [
            'show_in_footer' => true,
            'footer_order' => 4,
            'title' => 'Shipping Policy',
            'is_active' => true,
            'seo_title' => 'Shipping Policy — Blinds Town',
            'seo_description' => 'Learn about shipping times, tracking, and delivery for Blinds Town orders.',
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'return-refund-policy'], [
            'show_in_footer' => true,
            'footer_order' => 5,
            'title' => 'Return & Refund Policy',
            'is_active' => true,
            'seo_title' => 'Return & Refund Policy — Blinds Town',
            'seo_description' => 'Our policy on returns, refunds, and replacements for Blinds Town orders.',
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'contact'], [
            'title' => 'Contact Us',
            'is_active' => true,
            'sections' => [
                'business_name' => 'Blinds Town',
                'email' => 'hello@blindstown.test',
                'phone' => '+1 (555) 010-0100',
                'address' => "123 Main Street\nSpringfield",
                'hours' => 'Mon–Fri, 9am–6pm',
                'map_url' => null,
            ],
        ]);
    }
}
