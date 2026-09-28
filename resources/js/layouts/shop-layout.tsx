import { Link, usePage } from "@inertiajs/react";
import { Mail, Phone, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import AppLogo from "@/components/app-logo";
import { ShopHeader } from "@/components/shop/shop-header";
import { faq, home } from "@/routes";
import { index as ordersIndex } from "@/routes/orders";
import { show as categoryShow } from "@/routes/categories";
import {
    about,
    privacyPolicy,
    returnRefundPolicy,
    shippingPolicy,
    terms,
} from "@/routes/cms";
import { show as contactShow } from "@/routes/contact";
import { index as productsIndex } from "@/routes/products";

export default function ShopLayout({ children }: { children: ReactNode }) {
    const { auth, navCategories, contactInfo } = usePage().props;

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <ShopHeader />
            <main className="flex-1">{children}</main>

            <footer className="bg-[#1A1E1B] text-white/70">
                <div className="border-b border-white/10">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                                <Truck className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Free Shipping
                                </p>
                                <p className="text-xs">
                                    On every order, no minimums
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                                <ShieldCheck className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Secure Payments
                                </p>
                                <p className="text-xs">
                                    Checkout safely, powered by Stripe
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                                <Mail className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Need Help?
                                </p>
                                <p className="text-xs">
                                    {contactInfo?.email ??
                                        "We reply within 24 hours"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
                    <div className="lg:col-span-2">
                        <Link
                            href={home()}
                            className="inline-flex items-center rounded-sm bg-white px-2 py-1"
                        >
                            <AppLogo />
                        </Link>
                        <p className="mt-3 max-w-xs text-sm">
                            Made-to-measure blinds, cut precisely to your
                            window. Better windows, better living.
                        </p>

                        {(contactInfo?.phone || contactInfo?.email) && (
                            <ul className="mt-5 space-y-2 text-sm">
                                {contactInfo?.phone && (
                                    <li>
                                        <a
                                            href={`tel:${contactInfo.phone}`}
                                            className="flex items-center gap-2 hover:text-white"
                                        >
                                            <Phone className="size-4" />
                                            {contactInfo.phone}
                                        </a>
                                    </li>
                                )}
                                {contactInfo?.email && (
                                    <li>
                                        <a
                                            href={`mailto:${contactInfo.email}`}
                                            className="flex items-center gap-2 hover:text-white"
                                        >
                                            <Mail className="size-4" />
                                            {contactInfo.email}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Shop
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link
                                    href={productsIndex()}
                                    className="hover:text-white"
                                >
                                    All Blinds
                                </Link>
                            </li>
                            {navCategories.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        href={categoryShow(category.slug ?? "")}
                                        className="hover:text-white"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Customer Support
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link
                                    href={contactShow()}
                                    className="hover:text-white"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href={faq()} className="hover:text-white">
                                    FAQs
                                </Link>
                            </li>
                            {auth.user && (
                                <li>
                                    <Link
                                        href={ordersIndex()}
                                        className="hover:text-white"
                                    >
                                        My Orders
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Information
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link
                                    href={about()}
                                    className="hover:text-white"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={privacyPolicy()}
                                    className="hover:text-white"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={terms()}
                                    className="hover:text-white"
                                >
                                    Terms &amp; Conditions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={shippingPolicy()}
                                    className="hover:text-white"
                                >
                                    Shipping Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={returnRefundPolicy()}
                                    className="hover:text-white"
                                >
                                    Return &amp; Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-xs sm:flex-row sm:text-left">
                        <p>
                            &copy; {new Date().getFullYear()} Blinds Town. All
                            rights reserved.
                        </p>
                        <p className="flex items-center gap-1.5">
                            <ShieldCheck className="size-3.5" />
                            Secure payments powered by Stripe
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
