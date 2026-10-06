import { Link } from "@inertiajs/react";
import { Eye, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { index, show } from "@/routes/admin/orders";
import type { DashboardOrder } from "@/types";
import { formatDate, useDashboardFormat } from "./dashboard-format";
import { EmptyState, Panel } from "./panel";
import { OrderStatusPill, PaymentStatusPill } from "./status-pills";

function ProductCell({ order }: { order: DashboardOrder }) {
    if (!order.product) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <span className="flex items-center gap-1.5">
            <span className="max-w-44 truncate">{order.product}</span>
            {order.extra_items > 0 && (
                <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[11px] font-medium">
                    +{order.extra_items}
                </span>
            )}
        </span>
    );
}

export function RecentOrders({ orders }: { orders: DashboardOrder[] }) {
    const { money } = useDashboardFormat();

    return (
        <Panel
            title="Recent Orders"
            description="The latest orders across the store"
            flush
            action={
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mr-5 -mb-1"
                >
                    <Link href={index()} prefetch>
                        View All Orders
                    </Link>
                </Button>
            }
        >
            {orders.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    title="No orders yet"
                    description="New orders will show up here as customers check out."
                />
            ) : (
                <>
                    {/* Tablet and desktop: a proper table that scrolls sideways if it must. */}
                    <div className="hidden overflow-x-auto border-t md:block">
                        <table className="w-full min-w-[52rem] text-sm">
                            <thead>
                                <tr className="text-muted-foreground bg-muted/40 text-left text-xs">
                                    <th className="px-5 py-2.5 font-medium">
                                        Order ID
                                    </th>
                                    <th className="px-3 py-2.5 font-medium">
                                        Customer
                                    </th>
                                    <th className="px-3 py-2.5 font-medium">
                                        Product
                                    </th>
                                    <th className="px-3 py-2.5 text-right font-medium">
                                        Amount
                                    </th>
                                    <th className="px-3 py-2.5 font-medium">
                                        Payment
                                    </th>
                                    <th className="px-3 py-2.5 font-medium">
                                        Status
                                    </th>
                                    <th className="px-3 py-2.5 font-medium">
                                        Date
                                    </th>
                                    <th className="px-5 py-2.5 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-muted/40 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <Link
                                                href={show(order.id)}
                                                className="hover:text-primary font-medium whitespace-nowrap transition-colors"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="max-w-40 truncate font-medium">
                                                {order.customer_name}
                                            </p>
                                            {order.customer_email && (
                                                <p className="text-muted-foreground max-w-40 truncate text-xs">
                                                    {order.customer_email}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <ProductCell order={order} />
                                        </td>
                                        <td className="px-3 py-3 text-right font-semibold tabular-nums">
                                            {money(order.total)}
                                        </td>
                                        <td className="px-3 py-3">
                                            <PaymentStatusPill
                                                status={order.payment_status}
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <OrderStatusPill
                                                status={order.status}
                                            />
                                        </td>
                                        <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={show(order.id)}>
                                                    <Eye />
                                                    View
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phones: each order becomes a card instead of a cramped table. */}
                    <ul className="divide-y border-t md:hidden">
                        {orders.map((order) => (
                            <li key={order.id}>
                                <Link
                                    href={show(order.id)}
                                    className="hover:bg-muted/40 block space-y-2.5 px-5 py-4 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {order.order_number}
                                            </p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {order.customer_name}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold tabular-nums">
                                            {money(order.total)}
                                        </p>
                                    </div>
                                    <p className="text-sm">
                                        <ProductCell order={order} />
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <OrderStatusPill
                                            status={order.status}
                                        />
                                        <PaymentStatusPill
                                            status={order.payment_status}
                                        />
                                        <span className="text-muted-foreground ml-auto text-xs">
                                            {formatDate(order.created_at)}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </Panel>
    );
}
