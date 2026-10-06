import { Head, Link, router } from "@inertiajs/react";
import { Eye, PackageSearch, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusDot } from "@/components/admin/status-dot";
import { TableEmptyRow } from "@/components/admin/table-empty-row";
import { PaginationLinks } from "@/components/pagination-links";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
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

const COLUMNS: { key: SortColumn; label: string; align?: "right" }[] = [
    { key: "id", label: "ID" },
    { key: "customer_name", label: "Customer Name" },
    { key: "customer_email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "total", label: "Total", align: "right" },
    { key: "created_at", label: "Created" },
];

const ORDER_STATUS_DOT: Record<OrderStatus, string> = {
    pending: "bg-slate-400",
    confirmed: "bg-blue-500",
    measurement_pending: "bg-amber-500",
    manufacturing: "bg-purple-500",
    ready_to_ship: "bg-indigo-500",
    shipped: "bg-cyan-500",
    delivered: "bg-emerald-500",
    cancelled: "bg-red-500",
};

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
                                    status: value === "all" ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
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

                {/* Open table: no outer box, just hairline dividers. The negative
                    margin lets row hover backgrounds bleed past the text edge so
                    content still lines up with the toolbar above. */}
                <div className="-mx-3 mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
                                {COLUMNS.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className={cn(
                                            "px-3 py-3 font-medium whitespace-nowrap",
                                            column.align === "right" &&
                                                "text-right",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleSort(column.key)
                                            }
                                            className="hover:text-foreground focus-visible:ring-ring/50 -mx-1.5 rounded px-1.5 py-0.5 uppercase transition-colors outline-none focus-visible:ring-2"
                                        >
                                            {column.label}
                                        </button>
                                    </th>
                                ))}
                                <th scope="col" className="w-0 px-3 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() =>
                                        router.visit(show(order).url)
                                    }
                                    className="group hover:bg-muted/40 border-border/60 cursor-pointer border-b transition-colors"
                                >
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <Link
                                            href={show(order)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="font-medium hover:underline"
                                        >
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {order.user?.name ??
                                            order.shipping_name}
                                    </td>
                                    <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                                        {order.user?.email ??
                                            order.guest_email ??
                                            "—"}
                                    </td>
                                    <td className="px-3 py-4">
                                        <StatusDot
                                            label={
                                                ORDER_STATUS_LABELS[
                                                    order.status
                                                ]
                                            }
                                            dotClassName={
                                                ORDER_STATUS_DOT[order.status]
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-4 text-right font-semibold whitespace-nowrap tabular-nums">
                                        {formatCurrency(
                                            order.total,
                                            order.currency,
                                        )}
                                    </td>
                                    <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                                        {formatRelativeTime(order.created_at)}
                                    </td>
                                    <td className="px-3 py-4">
                                        {/* Revealed on hover for pointer devices;
                                            always visible on touch and when the
                                            link has keyboard focus. */}
                                        <div className="flex items-center justify-end transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                            <Link
                                                href={show(order)}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`View order ${order.order_number}`}
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && (
                                <TableEmptyRow
                                    colSpan={COLUMNS.length + 1}
                                    icon={PackageSearch}
                                    title="No orders found"
                                />
                            )}
                        </tbody>
                    </table>
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
