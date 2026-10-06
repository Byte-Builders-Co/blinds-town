import { Head, Link, usePage } from "@inertiajs/react";
import { Heart, MapPin, Package, Phone } from "lucide-react";
import { AccountLayout } from "@/components/account/account-layout";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { index as addressesIndex } from "@/routes/addresses";
import { index as ordersIndex, show as orderShow } from "@/routes/orders";
import type { Address, Order } from "@/types";

type Props = {
    stats: { orders: number; wishlist: number };
    recentOrders: Order[];
    defaultAddress: Address | null;
};

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof Package;
}) {
    return (
        <div className="flex items-center justify-between py-5 sm:px-6 sm:first:pl-0">
            <div>
                <p className="text-muted-foreground text-sm">{label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">
                    {value}
                </p>
            </div>
            <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                <Icon className="size-5" />
            </span>
        </div>
    );
}

export default function AccountIndex({
    stats,
    recentOrders,
    defaultAddress,
}: Props) {
    const { auth } = usePage().props;
    const firstName = auth.user.first_name || auth.user.name.split(" ")[0];

    return (
        <AccountLayout stats={stats}>
            <Head title="My Account" />

            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Welcome back, {firstName}!
                </h1>
                <p className="text-muted-foreground mt-1.5 text-sm">
                    Manage your blinds orders, fabric samples, and
                    profile details.
                </p>
            </div>

            <div className="grid divide-y border-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <StatCard
                    label="Total Orders"
                    value={stats.orders}
                    icon={Package}
                />
                <StatCard
                    label="Wishlist items"
                    value={stats.wishlist}
                    icon={Heart}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <section>
                    <div className="flex items-start justify-between gap-4 border-b pb-4">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Recent Orders
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Overview of your latest purchases
                            </p>
                        </div>
                        <Link
                            href={ordersIndex()}
                            className="text-sm font-medium hover:underline"
                        >
                            View All &rsaquo;
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-muted-foreground py-10 text-center text-sm">
                            You haven&apos;t placed any orders yet.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {recentOrders.map((order) => {
                                const first = order.items?.[0];
                                const image = first?.product?.image_path;
                                const more = (order.items_count ?? 0) - 1;

                                return (
                                    <div
                                        key={order.id}
                                        className="py-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                                            <p className="text-sm">
                                                <span className="font-semibold">
                                                    Order{" "}
                                                    {order.order_number}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {" "}
                                                    ·{" "}
                                                    {formatDate(
                                                        order.created_at,
                                                    )}
                                                </span>
                                            </p>
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 pt-3">
                                            {image ? (
                                                <img
                                                    src={`/storage/${image}`}
                                                    alt=""
                                                    className="size-12 shrink-0 rounded-md object-cover"
                                                />
                                            ) : (
                                                <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-md">
                                                    <Package className="size-5" />
                                                </span>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {first?.product_name ??
                                                        "Order items"}
                                                    {more > 0 &&
                                                        ` + ${more} more`}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    Total:{" "}
                                                    <span className="text-foreground font-medium">
                                                        {formatCurrency(
                                                            order.total,
                                                            order.currency,
                                                        )}
                                                    </span>
                                                </p>
                                            </div>
                                            <Link
                                                href={orderShow(
                                                    order.order_number,
                                                )}
                                                className="text-muted-foreground hover:text-foreground shrink-0 text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="flex flex-col xl:border-l xl:pl-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="flex items-center gap-2 text-lg font-semibold">
                            <MapPin className="text-muted-foreground size-4" />
                            Default Address
                        </h2>
                        {defaultAddress && (
                            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                                Primary
                            </span>
                        )}
                    </div>

                    {defaultAddress ? (
                        <div className="flex-1 space-y-1 pt-4 text-sm">
                            <p className="font-semibold">
                                {defaultAddress.full_name}
                            </p>
                            <p className="text-muted-foreground">
                                {defaultAddress.address_line1}
                            </p>
                            {defaultAddress.address_line2 && (
                                <p className="text-muted-foreground">
                                    {defaultAddress.address_line2}
                                </p>
                            )}
                            <p className="text-muted-foreground">
                                {defaultAddress.city},{" "}
                                {defaultAddress.state} -{" "}
                                {defaultAddress.pincode}
                            </p>
                            <p className="text-muted-foreground">
                                {defaultAddress.country}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-2 pt-2">
                                <Phone className="size-3.5" />
                                {defaultAddress.mobile_number}
                            </p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground flex-1 pt-4 text-sm">
                            You haven&apos;t saved an address yet.
                        </p>
                    )}

                    <Button asChild className="mt-6 w-full">
                        <Link href={addressesIndex()}>
                            Manage Address
                        </Link>
                    </Button>
                </section>
            </div>

        </AccountLayout>
    );
}
