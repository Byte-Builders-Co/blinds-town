import { Head, Link, router } from '@inertiajs/react';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { PaymentStatusBadge } from '@/components/shop/payment-status-badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { index, show } from '@/routes/admin/orders';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';
import type { Order, OrderStatus, PaymentStatus, Paginated } from '@/types';

export default function AdminOrdersIndex({
    orders,
    statuses,
    paymentStatuses,
    filters,
}: {
    orders: Paginated<Order>;
    statuses: OrderStatus[];
    paymentStatuses: PaymentStatus[];
    filters: { status?: string; payment_status?: string };
}) {
    const updateFilters = (patch: Record<string, string | undefined>) => {
        router.get(
            index().url,
            { ...filters, ...patch },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title="Orders" />

            <div className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold">Orders</h1>
                    <div className="flex items-center gap-2">
                        <Select
                            value={filters.status ?? 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    status: value === 'all' ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All statuses
                                </SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {ORDER_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.payment_status ?? 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    payment_status:
                                        value === 'all' ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All payment statuses
                                </SelectItem>
                                {paymentStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {PAYMENT_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-6 divide-y rounded-lg border">
                    {orders.data.map((order) => (
                        <Link
                            key={order.id}
                            href={show(order)}
                            className="hover:bg-accent flex items-center justify-between px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">
                                    {order.order_number}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString()}
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

                <div className="mt-6">
                    <PaginationLinks paginated={orders} />
                </div>
            </div>
        </>
    );
}

AdminOrdersIndex.layout = {
    breadcrumbs: [{ title: 'Orders', href: index() }],
};
