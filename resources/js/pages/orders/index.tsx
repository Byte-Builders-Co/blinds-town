import { Head, Link } from "@inertiajs/react";
import { Package } from "lucide-react";
import { AccountLayout } from "@/components/account/account-layout";
import { PaginationLinks } from "@/components/pagination-links";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { index as productsIndex } from "@/routes/products";
import { show } from "@/routes/orders";
import type { Order, Paginated } from "@/types";

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export default function OrdersIndex({
    stats,
    orders,
}: {
    stats: { orders: number; wishlist: number };
    orders: Paginated<Order>;
}) {
    return (
        <AccountLayout stats={stats}>
            <Head title="My Orders" />

            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    My Orders
                </h1>
                <p className="text-muted-foreground mt-1.5 text-sm">
                    Track, review and manage all of your blinds orders.
                </p>
            </div>

            {orders.data.length === 0 ? (
                <div className="flex flex-col items-center border-y px-6 py-16 text-center">
                    <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                        <Package className="size-6" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold">
                        No orders yet
                    </h2>
                    <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                        When you place an order, it will show up here.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href={productsIndex()}>Start shopping</Link>
                    </Button>
                </div>
            ) : (
                <>
                <div className="divide-y border-y">
                    {orders.data.map((order) => (
                        <Link
                            key={order.id}
                            href={show(order.order_number)}
                            className="hover:bg-accent/40 focus-visible:bg-accent/40 flex flex-wrap items-center justify-between gap-4 py-5 transition-colors outline-none"
                        >
                            <div className="min-w-0">
                                <p className="font-semibold">
                                    {order.order_number}
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-sm">
                                    {formatDate(order.created_at)}
                                    {order.items_count !== undefined &&
                                        ` · ${order.items_count} item${order.items_count === 1 ? "" : "s"}`}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <OrderStatusBadge status={order.status} />
                                <span className="ml-2 font-semibold tabular-nums">
                                    {formatCurrency(
                                        order.total,
                                        order.currency,
                                    )}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="pt-2">
                    <PaginationLinks paginated={orders} label="orders" />
                </div>
                </>
            )}
        </AccountLayout>
    );
}
