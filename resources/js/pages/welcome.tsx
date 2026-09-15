import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardCheck,
    Palette,
    Ruler,
    Shirt,
    ShieldCheck,
    Truck,
    Wrench,
} from 'lucide-react';
import { CategoryCard } from '@/components/shop/category-card';
import { ProductCard } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { index as categoriesIndex } from '@/routes/categories';
import { index as productsIndex } from '@/routes/products';
import type {
    Category,
    CmsBanner,
    CmsPage,
    HomepageSections,
    Product,
} from '@/types';

const defaultHero: HomepageSections['hero'] = {
    heading: 'Made-to-measure blinds,\ncut precisely to your window.',
    subheading:
        "Enter your window's width and height, pick your finish, and we'll cut it to size. Free shipping on every order.",
    cta_text: 'Shop blinds',
    cta_url: '#categories',
    secondary_cta_text: 'Custom Blind',
    secondary_cta_url: '#',
    image_path: null,
};

const whyChooseUs = [
    {
        icon: Ruler,
        title: 'Custom-Made Sizes',
        description: 'Perfect fit for every window',
    },
    {
        icon: Shirt,
        title: 'Premium Fabrics',
        description: 'Durable & stylish materials',
    },
    {
        icon: Wrench,
        title: 'Easy Installation',
        description: 'Hassle-free setup',
    },
    {
        icon: ClipboardCheck,
        title: 'Free Measurement Guidance',
        description: 'Expert support, always',
    },
    {
        icon: ShieldCheck,
        title: 'Secure Payment',
        description: 'Safe & trusted transactions',
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        description: 'At your doorstep',
    },
];

const howItWorks = [
    {
        title: 'Choose Your Blind',
        description: 'Explore our collection',
    },
    {
        title: 'Enter Measurements',
        description: 'Get the perfect fit',
    },
    {
        title: 'Customize Fabric & Style',
        description: 'Pick your colors & options',
    },
    {
        title: 'Place Order',
        description: 'Secure checkout',
    },
    {
        title: 'Get It Delivered',
        description: 'Right to your home',
    },
];

const aboutIcons = [Ruler, Palette, Truck, ShieldCheck];

function aboutHighlights(body: string) {
    return body
        .split('\n\n')
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => {
            const [title, ...rest] = paragraph.split(' — ');
            const description = rest.join(' — ').trim();

            return {
                title: title.trim(),
                description: description
                    ? description.charAt(0).toUpperCase() + description.slice(1)
                    : '',
            };
        });
}

export default function Welcome({
    categories,
    featuredProducts,
    banners,
    page,
}: {
    categories: Category[];
    featuredProducts: Product[];
    banners: CmsBanner[];
    page: CmsPage | null;
}) {
    const sections = page?.sections as unknown as HomepageSections | undefined;

    const hero = sections?.hero?.heading ? sections.hero : defaultHero;
    const promo = sections?.promo;
    const about = sections?.about;

    return (
        <>
            <Head title="Made-to-Measure Blinds" />

            {/* Hero */}
            <section className="border-border/60 border-b">
                {hero.image_path ? (
                    <div className="relative">
                        <img
                            src={`/storage/${hero.image_path}`}
                            alt={hero.heading}
                            className="h-96 w-full object-cover sm:h-128 lg:h-220"
                        />

                        <div className="absolute inset-0 bg-black/50" />

                        <div className="absolute inset-0 flex items-center">
                            <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6 lg:px-8">
                                <h1 className="text-3xl font-semibold tracking-tight whitespace-pre-line sm:text-4xl lg:text-5xl">
                                    {hero.heading}
                                </h1>

                                <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                                    {hero.subheading}
                                </p>

                                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                                    <Button size="lg" asChild>
                                        <a href={hero.cta_url || '#categories'}>
                                            {hero.cta_text || 'Shop blinds'}
                                        </a>
                                    </Button>

                                    {hero.secondary_cta_text && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="bg-white/10 text-white hover:bg-white/20"
                                            asChild
                                        >
                                            <a
                                                href={
                                                    hero.secondary_cta_url ||
                                                    '#'
                                                }
                                            >
                                                {hero.secondary_cta_text}
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8">
                        <h1 className="text-3xl font-semibold tracking-tight whitespace-pre-line sm:text-4xl lg:text-5xl">
                            {hero.heading}
                        </h1>

                        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm sm:text-base">
                            {hero.subheading}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                            <Button size="lg" asChild>
                                <a href={hero.cta_url || '#categories'}>
                                    {hero.cta_text || 'Shop blinds'}
                                </a>
                            </Button>

                            {hero.secondary_cta_text && (
                                <Button size="lg" variant="outline" asChild>
                                    <a href={hero.secondary_cta_url || '#'}>
                                        {hero.secondary_cta_text}
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Promotional Banners */}
            {banners.length > 0 && (
                <section className="border-border/60 border-b">
                    <div className="mx-auto max-w-6xl gap-4 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex gap-4">
                            {banners.map((banner) => (
                                <a
                                    key={banner.id}
                                    href={banner.button_url ?? '#'}
                                    className="group relative block w-72 shrink-0 overflow-hidden rounded-sm border"
                                >
                                    <img
                                        src={`/storage/${banner.image_path}`}
                                        alt={banner.title}
                                        className="h-36 w-full object-cover transition group-hover:scale-105"
                                    />

                                    <div className="p-3">
                                        <p className="font-medium">
                                            {banner.title}
                                        </p>

                                        {banner.subtitle && (
                                            <p className="text-muted-foreground text-sm">
                                                {banner.subtitle}
                                            </p>
                                        )}

                                        {banner.button_text && (
                                            <p className="text-primary mt-1 text-sm font-medium">
                                                {banner.button_text} &rarr;
                                            </p>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories */}
            <section
                id="categories"
                className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8"
            >
                <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
                    <h2 className="text-xl font-semibold sm:text-2xl">
                        Shop by Category
                    </h2>

                    <Link
                        href={categoriesIndex()}
                        className="text-primary flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
                    >
                        View All
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                    {categories.slice(0, 4).map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                    <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
                        <h2 className="text-xl font-semibold sm:text-2xl">
                            Featured Products
                        </h2>

                        <Link
                            href={productsIndex()}
                            className="text-primary flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
                        >
                            View All
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                        {featuredProducts.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* Promo */}
            {promo?.heading && (
                <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-sm border lg:grid-cols-2">
                        {promo.image_path && (
                            <img
                                src={`/storage/${promo.image_path}`}
                                alt=""
                                className="h-56 w-full object-cover lg:h-auto"
                            />
                        )}

                        <div className="bg-muted flex flex-col justify-center px-6 py-6 sm:px-10 sm:py-8 lg:px-14">
                            {promo.eyebrow && (
                                <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                                    {promo.eyebrow}
                                </p>
                            )}

                            <h2 className="mt-2 text-2xl font-semibold tracking-tight whitespace-pre-line sm:text-3xl lg:text-4xl">
                                {promo.heading}
                            </h2>

                            {promo.subheading && (
                                <p className="text-muted-foreground mt-3 max-w-md">
                                    {promo.subheading}
                                </p>
                            )}

                            {promo.button_text && (
                                <div className="mt-5">
                                    <Button size="lg" asChild>
                                        <a href={promo.button_url || '/'}>
                                            {promo.button_text}
                                            <ArrowRight className="size-4" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Why Choose Us */}
            <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <h2 className="mb-3 text-xl font-semibold sm:mb-5 sm:text-2xl">
                    Why Choose Us
                </h2>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
                    {whyChooseUs.map((item) => (
                        <div
                            key={item.title}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="bg-muted flex size-12 items-center justify-center rounded-sm sm:size-14">
                                <item.icon className="text-primary size-6" />
                            </div>

                            <p className="mt-2 text-sm font-medium">
                                {item.title}
                            </p>

                            <p className="text-muted-foreground mt-1 text-xs">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="">
                <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                    <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">
                        How It Works
                    </h2>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        {howItWorks.map((step, index) => (
                            <div
                                key={step.title}
                                className="flex items-center gap-3 sm:contents"
                            >
                                <div className="flex flex-1 flex-col items-start gap-1 sm:items-center sm:text-center">
                                    <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-sm text-sm font-semibold">
                                        {index + 1}
                                    </span>

                                    <p className="mt-2 text-sm font-medium">
                                        {step.title}
                                    </p>

                                    <p className="text-muted-foreground text-xs">
                                        {step.description}
                                    </p>
                                </div>

                                {index < howItWorks.length - 1 && (
                                    <ArrowRight className="text-muted-foreground mt-4 hidden size-5 shrink-0 sm:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About */}
            {about?.body && (
                <section className="">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-2 lg:px-8">
                        {about.image_path && (
                            <img
                                src={`/storage/${about.image_path}`}
                                alt=""
                                className="h-72 w-full rounded-sm object-cover lg:h-120"
                            />
                        )}

                        <div>
                            <span className="bg-primary mb-3 block h-0.5 w-12" />

                            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
                                {about.heading}
                            </h2>

                            <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
                                {aboutHighlights(about.body).map(
                                    (item, index) => {
                                        const Icon =
                                            aboutIcons[
                                                index % aboutIcons.length
                                            ];

                                        return (
                                            <div
                                                key={item.title}
                                                className="flex gap-3"
                                            >
                                                <div className="bg-background flex size-12 shrink-0 items-center justify-center rounded-sm">
                                                    <Icon className="text-primary size-6" />
                                                </div>

                                                <div>
                                                    <p className="font-semibold">
                                                        {item.title}
                                                    </p>

                                                    <p className="text-muted-foreground mt-1 text-sm">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
