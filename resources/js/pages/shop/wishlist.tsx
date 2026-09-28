import { Head, Link } from "@inertiajs/react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { formatCurrency } from "@/lib/utils";
import { show } from "@/routes/products";
import { STOCK_STATUS_LABELS } from "@/types";
import type { WishlistItem } from "@/types";

export default function Wishlist({ items }: { items: WishlistItem[] }) {
    return (
        <>
            <Head title="Wishlist" />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">Your Wishlist</h1>

                {items.length === 0 ? (
                    <p className="text-muted-foreground mt-8">
                        You haven&apos;t added anything to your wishlist yet.
                    </p>
                ) : (
                    <div className="mt-8 divide-y">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 py-4"
                            >
                                {item.product.image_path && (
                                    <img
                                        src={`/storage/${item.product.image_path}`}
                                        alt={item.product.name}
                                        className="size-20 rounded-md object-cover"
                                    />
                                )}

                                <div className="flex-1">
                                    <Link
                                        href={show(item.product.slug)}
                                        className="font-medium hover:underline"
                                    >
                                        {item.product.name}
                                    </Link>
                                    <p className="mt-1 text-sm font-medium">
                                        From{" "}
                                        {formatCurrency(
                                            item.product.sale_price ??
                                                item.product.base_price,
                                        )}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
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

                                <Button asChild size="sm">
                                    <Link href={show(item.product.slug)}>
                                        View Product
                                    </Link>
                                </Button>

                                <WishlistButton
                                    product={item.product}
                                    initialWishlisted
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
