import { Head, Link, router } from "@inertiajs/react";
import { Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PaginationLinks } from "@/components/pagination-links";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { index, show } from "@/routes/admin/orders";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/types";
import type { Order, OrderStatus, PaymentStatus, Paginated } from "@/types";

type SortColumn =
    | "id"
    | "customer_name"
    | "customer_email"
    | "status"
    | "total"
    | "created_at";

type Filters = {
    status?: string;
    payment_status?: string;
    search?: string;
    sort?: string;
    direction?: string;
};

const COLUMNS: { key: SortColumn; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "customer_name", label: "Customer Name" },
    { key: "customer_email", label: " Email" },
    { key: "status", label: "Status" },
    { key: "total", label: "Total" },
    { key: "created_at", label: "Created" },
];

export default function AdminOrdersIndex({
    orders,
    statuses,
    paymentStatuses,
    filters,
}: {
    orders: Paginated<Order>;
    statuses: OrderStatus[];
    paymentStatuses: PaymentStatus[];
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? "");

    const applyFilters = (patch: Partial<Filters>) => {
        router.get(
            index().url,
            { ...filters, search, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    useEffect(() => {
        if (search === (filters.search ?? "")) return;

        const timeout = setTimeout(() => {
            router.get(
                index().url,
                { ...filters, search },
                { preserveState: true, preserveScroll: true },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, filters]);

    const toggleSort = (column: SortColumn) => {
        const direction =
            filters.sort === column && filters.direction === "asc"
                ? "desc"
                : "asc";
        applyFilters({ sort: column, direction });
    };

    return (
        <>
            <Head title="Orders" />

            <div className="p-4 md:p-4">
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" />
                            <Input
                                placeholder="Search order number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        <Select
                            value={filters.status ?? "all"}
                            onValueChange={(value) =>
                                applyFilters({
                                    status:
                                        value === "all" ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Status
                                </SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {ORDER_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.payment_status ?? "all"}
                            onValueChange={(value) =>
                                applyFilters({
                                    payment_status:
                                        value === "all" ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All payments
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

                <div className="mt-4 rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/40 text-muted-foreground border-b text-left">
                                    {COLUMNS.map((column) => (
                                        <th
                                            key={column.key}
                                            className="px-4 py-3 font-medium whitespace-nowrap"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort(column.key)
                                                }
                                                className="hover:text-foreground"
                                            >
                                                {column.label}
                                            </button>
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() =>
                                            router.visit(show(order).url)
                                        }
                                        className="hover:bg-accent/50 cursor-pointer"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={show(order)}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="font-medium hover:underline"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {order.user?.name ?? "—"}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                            {order.user?.email ?? "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                                            {formatCurrency(
                                                order.total,
                                                order.currency,
                                            )}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                            {formatRelativeTime(
                                                order.created_at,
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={show(order)}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md"
                                                aria-label={`View order ${order.order_number}`}
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={COLUMNS.length + 1}
                                            className="text-muted-foreground px-4 py-10 text-center"
                                        >
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4">
                    <PaginationLinks paginated={orders} label="orders" />
                </div>
            </div>
        </>
    );
}

AdminOrdersIndex.layout = {
    breadcrumbs: [{ title: "Orders", href: index() }],
};
