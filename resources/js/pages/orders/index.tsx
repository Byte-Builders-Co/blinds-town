import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { PaginationLinks } from '@/components/pagination-links';
import { PaymentStatusBadge } from '@/components/shop/payment-status-badge';
import { formatCurrency } from '@/lib/utils';
import { show } from '@/routes/orders';
import { ORDER_STATUS_LABELS } from '@/types';
import type { Order, Paginated } from '@/types';

export default function OrdersIndex({ orders }: { orders: Paginated<Order> }) {
    return (
        <>
            <Head title="My Orders" />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">My Orders</h1>

                {orders.data.length === 0 ? (
                    <p className="text-muted-foreground mt-8">
                        You haven't placed any orders yet.
                    </p>
                ) : (
                    <div className="mt-8 divide-y">
                        {orders.data.map((order) => (
                            <Link
                                key={order.id}
                                href={show(order.order_number)}
                                className="hover:bg-accent flex items-center justify-between rounded-md px-2 py-4"
                            >
                                <div>
                                    <p className="font-medium">
                                        {order.order_number}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString()}
                                        {order.items_count !== undefined &&
                                            ` · ${order.items_count} item${order.items_count === 1 ? '' : 's'}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {ORDER_STATUS_LABELS[order.status]}
                                    </Badge>
                                    {order.payment && (
                                        <PaymentStatusBadge
                                            status={order.payment.status}
                                        />
                                    )}
                                    <span className="font-medium">
                                        {formatCurrency(
                                            order.total,
                                            order.currency,
                                        )}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <PaginationLinks paginated={orders} />
                </div>
            </div>
        </>
    );
}
