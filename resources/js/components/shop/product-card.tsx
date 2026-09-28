import { Link } from "@inertiajs/react";
import { ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { formatCurrency } from "@/lib/utils";
import { show } from "@/routes/products";
import type { Product } from "@/types";

export function ProductCard({
    product,
    isWishlisted = false,
}: {
    product: Product;
    isWishlisted?: boolean;
}) {
    const hasDiscount = product.sale_price !== null;
    const isOutOfStock = product.stock_status === "out_of_stock";
    const colorSwatches =
        product.option_groups?.find((group) => group.kind === "color")
            ?.values ?? [];
    const visibleSwatches = colorSwatches.slice(0, 5);
    const extraSwatchCount = colorSwatches.length - visibleSwatches.length;

    return (
        <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
            <div className="relative">
                <Link href={show(product.slug)}>
                    {product.image_path && (
                        <img
                            src={`/storage/${product.image_path}`}
                            alt={product.name}
                            className="aspect-square w-full object-cover"
                        />
                    )}
                </Link>

                {isOutOfStock ? (
                    <Badge
                        variant="secondary"
                        className="absolute top-3 left-3"
                    >
                        Out of Stock
                    </Badge>
                ) : (
                    hasDiscount && (
                        <Badge
                            variant="destructive"
                            className="absolute top-3 left-3"
                        >
                            {Math.round(Number(product.discount_percent))}% OFF
                        </Badge>
                    )
                )}

                <WishlistButton
                    product={product}
                    initialWishlisted={isWishlisted}
                    className="bg-background/80 absolute top-3 right-3"
                />
            </div>

            <CardContent className="flex flex-col gap-2 px-3 py-3 sm:px-4 sm:py-4">
                <Link href={show(product.slug)}>
                    <CardTitle className="line-clamp-1 text-sm sm:text-base">
                        {product.name}
                    </CardTitle>
                </Link>

                {product.reviews_count !== undefined &&
                    product.reviews_count > 0 && (
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Star className="size-3.5 shrink-0 fill-current text-amber-500" />
                            {product.reviews_avg_rating?.toFixed(1)} (
                            {product.reviews_count})
                        </span>
                    )}

                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {hasDiscount ? (
                        <>
                            <span className="text-sm font-semibold sm:text-base">
                                From {formatCurrency(product.sale_price!)}
                            </span>
                            <span className="text-muted-foreground text-xs line-through sm:text-sm">
                                {formatCurrency(product.base_price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm font-semibold sm:text-base">
                            From {formatCurrency(product.base_price)}
                        </span>
                    )}
                </div>

                {visibleSwatches.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {visibleSwatches.map((value) => (
                            <span
                                key={value.id}
                                title={value.label}
                                className="border-border size-4 shrink-0 rounded-full border"
                                style={{
                                    backgroundColor:
                                        value.hex_color ?? "#e5e5e5",
                                }}
                            />
                        ))}
                        {extraSwatchCount > 0 && (
                            <span className="text-muted-foreground text-xs">
                                +{extraSwatchCount}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-3 pt-0 pb-3 sm:px-4 sm:pb-4">
                <Button
                    asChild
                    variant={isOutOfStock ? "outline" : "default"}
                    size="sm"
                    className="w-full sm:h-9 sm:px-4 sm:py-2 sm:text-sm"
                >
                    <Link href={show(product.slug)}>
                        <ShoppingCart className="size-4" />
                        {isOutOfStock ? "View Details" : "Buy Now"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
