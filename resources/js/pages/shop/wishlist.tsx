import { Head, Link } from "@inertiajs/react";
import { Heart, Star } from "lucide-react";
import { AccountLayout } from "@/components/account/account-layout";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { index as productsIndex, show } from "@/routes/products";
import { STOCK_STATUS_LABELS } from "@/types";
import type { WishlistItem } from "@/types";

export default function Wishlist({
    stats,
    items,
}: {
    stats: { orders: number; wishlist: number };
    items: WishlistItem[];
}) {
    return (
        <AccountLayout stats={stats}>
            <Head title="My Wishlist" />

            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    My Wishlist
                </h1>
                <p className="text-muted-foreground mt-1.5 text-sm">
                    Blinds you&apos;ve saved for later.
                </p>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center border-y px-6 py-16 text-center">
                    <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                        <Heart className="size-6" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold">
                        Your wishlist is empty
                    </h2>
                    <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                        Tap the heart on any product to save it here.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href={productsIndex()}>Browse blinds</Link>
                    </Button>
                </div>
            ) : (
                <div className="divide-y border-y">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-wrap items-center gap-4 py-4 sm:flex-nowrap"
                        >
                            {item.product.image_path ? (
                                <img
                                    src={`/storage/${item.product.image_path}`}
                                    alt={item.product.name}
                                    className="size-20 shrink-0 rounded-lg object-cover"
                                />
                            ) : (
                                <span className="bg-muted size-20 shrink-0 rounded-lg" />
                            )}

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <Link
                                    href={show(item.product.slug)}
                                    className="font-medium hover:underline"
                                >
                                    {item.product.name}
                                </Link>
                                    <WishlistButton
                                        product={item.product}
                                        initialWishlisted
                                        variant="ghost"
                                        className="size-7"
                                    />
                                </div>
                                <p className="mt-1 text-sm font-semibold">
                                    From{" "}
                                    {formatCurrency(
                                        item.product.sale_price ??
                                            item.product.base_price,
                                    )}
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {
                                            STOCK_STATUS_LABELS[
                                                item.product.stock_status
                                            ]
                                        }
                                    </Badge>
                                    {item.product.reviews_count ? (
                                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                            <Star className="size-3.5 fill-current text-amber-500" />
                                            {item.product.reviews_avg_rating?.toFixed(
                                                1,
                                            )}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <Link
                                href={show(item.product.slug)}
                                className="text-foreground/60 hover:text-foreground shrink-0 text-sm font-medium transition-colors"
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </AccountLayout>
    );
}
