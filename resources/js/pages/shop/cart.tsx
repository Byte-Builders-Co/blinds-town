import { Head, Link, router } from "@inertiajs/react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { resolveSelectedOptionLabels } from "@/lib/shop";
import { destroy, update } from "@/routes/cart";
import { index as checkoutIndex } from "@/routes/checkout";
import { show } from "@/routes/products";
import type { Cart } from "@/types";

export default function ShopCart({ cart }: { cart: Cart }) {
    const grandTotal = cart.items.reduce(
        (sum, item) => sum + Number(item.line_total),
        0,
    );
    const subtotal = cart.items.reduce(
        (sum, item) =>
            sum +
            (item.price_breakdown
                ? item.price_breakdown.subtotal * item.quantity
                : Number(item.unit_price) * item.quantity),
        0,
    );
    const discount = cart.items.reduce(
        (sum, item) =>
            sum +
            (item.price_breakdown
                ? item.price_breakdown.product_discount * item.quantity
                : 0),
        0,
    );
    const tax = cart.items.reduce(
        (sum, item) =>
            sum +
            (item.price_breakdown
                ? item.price_breakdown.tax_amount * item.quantity
                : 0),
        0,
    );

    return (
        <>
            <Head title="Your Cart" />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">Your Cart</h1>

                {cart.items.length === 0 ? (
                    <p className="text-muted-foreground mt-8">
                        Your cart is empty.
                    </p>
                ) : (
                    <>
                        <div className="mt-8 divide-y">
                            {cart.items.map((item) => {
                                const optionLabels =
                                    resolveSelectedOptionLabels(
                                        item.product,
                                        item.selected_options,
                                    );

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between gap-4 py-4"
                                    >
                                        {item.product?.image_path && (
                                            <img
                                                src={`/storage/${item.product.image_path}`}
                                                alt={item.product.name}
                                                className="size-16 rounded-md object-cover"
                                            />
                                        )}

                                        <div className="flex-1">
                                            {item.product && (
                                                <Link
                                                    href={show(
                                                        item.product.slug,
                                                    )}
                                                    className="font-medium hover:underline"
                                                >
                                                    {item.product.name}
                                                </Link>
                                            )}
                                            <dl className="text-muted-foreground mt-1 space-y-0.5 text-sm">
                                                <div>
                                                    <span className="font-medium">
                                                        Width:
                                                    </span>{" "}
                                                    {item.width_cm}cm
                                                    {"  "}
                                                    <span className="font-medium">
                                                        Height:
                                                    </span>{" "}
                                                    {item.height_cm}cm
                                                </div>
                                                {optionLabels.map((o, i) => (
                                                    <div key={i}>
                                                        <span className="font-medium">
                                                            {o.group}:
                                                        </span>{" "}
                                                        {o.label}
                                                    </div>
                                                ))}
                                            </dl>
                                            <p className="mt-1 text-sm">
                                                {formatCurrency(
                                                    item.unit_price,
                                                )}{" "}
                                                each
                                            </p>
                                            <div className="mt-1 flex items-center gap-3">
                                                {item.measurement_photo_path && (
                                                    <a
                                                        href={`/storage/${item.measurement_photo_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-primary text-xs underline"
                                                    >
                                                        View measurement photo
                                                    </a>
                                                )}
                                                {item.product && (
                                                    <Link
                                                        href={show(
                                                            item.product.slug,
                                                            {
                                                                query: {
                                                                    edit: item.id,
                                                                },
                                                            },
                                                        )}
                                                        className="text-primary flex items-center gap-1 text-xs underline"
                                                    >
                                                        <Pencil className="size-3" />
                                                        Edit configuration
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        <Input
                                            type="number"
                                            min={1}
                                            max={50}
                                            defaultValue={item.quantity}
                                            className="w-20"
                                            onBlur={(e) => {
                                                const quantity = Number(
                                                    e.target.value,
                                                );
                                                if (
                                                    quantity > 0 &&
                                                    quantity !== item.quantity
                                                ) {
                                                    router.patch(
                                                        update(item.id).url,
                                                        { quantity },
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }
                                            }}
                                        />

                                        <p className="w-24 text-right font-medium">
                                            {formatCurrency(item.line_total)}
                                        </p>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                router.delete(
                                                    destroy(item.id).url,
                                                    { preserveScroll: true },
                                                )
                                            }
                                            aria-label="Remove item"
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-2 border-t pt-6">
                            <div className="text-muted-foreground flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="text-muted-foreground flex justify-between text-sm">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(discount)}</span>
                                </div>
                            )}
                            {tax > 0 && (
                                <div className="text-muted-foreground flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 text-lg font-semibold">
                                <span>Grand Total</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button size="lg" asChild>
                                    <Link href={checkoutIndex()}>
                                        Proceed to checkout
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
