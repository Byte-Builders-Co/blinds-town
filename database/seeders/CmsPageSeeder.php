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
            'title' => 'About Us',
            'is_active' => true,
            'content' => "Blinds Town has been crafting made-to-measure window blinds for homes and businesses.\n\nEvery blind is cut to your exact measurements, using quality materials and built to last.",
            'seo_title' => 'About Us — Blinds Town',
            'seo_description' => 'Learn about Blinds Town and our made-to-measure blinds.',
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'privacy-policy'], [
            'title' => 'Privacy Policy',
            'is_active' => true,
            'content' => "This privacy policy explains how we collect, use, and protect your information when you use our store.\n\nPlease contact us if you have any questions about how your data is handled.",
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'terms'], [
            'title' => 'Terms & Conditions',
            'is_active' => true,
            'content' => "By using this website and placing an order, you agree to the following terms and conditions.\n\nAll blinds are made to order based on the measurements you provide.",
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'shipping-policy'], [
            'title' => 'Shipping Policy',
            'is_active' => true,
            'content' => "We offer free shipping on every order, with no minimum purchase required.\n\nMade-to-measure blinds are manufactured after your order is placed, so please allow additional processing time before dispatch. Estimated delivery times will be shown in your order confirmation email.\n\nOnce your order ships, you'll receive a tracking number by email. You can also track your order status at any time from My Orders in your account.\n\nIf your order arrives damaged or incomplete, please contact us within 48 hours of delivery so we can make it right.",
            'seo_title' => 'Shipping Policy — Blinds Town',
            'seo_description' => 'Learn about shipping times, tracking, and delivery for Blinds Town orders.',
        ]);

        CmsPage::query()->firstOrCreate(['slug' => 'return-refund-policy'], [
            'title' => 'Return & Refund Policy',
            'is_active' => true,
            'content' => "Because every blind is custom-made to your exact measurements, we're unable to accept returns for made-to-measure errors that match the measurements and options you selected at checkout.\n\nIf your order arrives damaged, defective, or incorrect compared to what you ordered, contact us within 7 days of delivery and we'll arrange a replacement or refund at no cost to you.\n\nApproved refunds are issued to your original payment method and typically appear within 5–10 business days.\n\nTo start a return or report an issue, please reach out through our Contact Us page with your order number and photos of the item.",
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
