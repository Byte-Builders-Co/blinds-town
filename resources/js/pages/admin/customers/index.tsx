import { Head, Link, router } from "@inertiajs/react";
import {
    Download,
    Eye,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserSearch,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StatusDot, USER_STATUS_DOT } from "@/components/admin/status-dot";
import { TableEmptyRow } from "@/components/admin/table-empty-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationLinks } from "@/components/pagination-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/utils";
import {
    create,
    destroy,
    edit,
    exportMethod as exportCustomers,
    index,
    show,
} from "@/routes/admin/customers";
import { USER_STATUS_LABELS } from "@/types/auth";
import type { Paginated, User, UserStatus } from "@/types";

type SortColumn =
    | "id"
    | "first_name"
    | "last_name"
    | "email"
    | "last_login_at"
    | "created_at";

type Filters = {
    search?: string;
    status?: string;
    sort?: string;
    direction?: string;
};

const COLUMNS: { key: SortColumn; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "last_login_at", label: "Last Login" },
    { key: "created_at", label: "Created" },
];

export default function AdminCustomersIndex({
    customers,
    filters,
    statuses,
}: {
    customers: Paginated<User>;
    filters: Filters;
    statuses: UserStatus[];
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [customerToDelete, setCustomerToDelete] = useState<User | null>(null);

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
            <Head title="Customers" />

            <div className="p-4 md:p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-72">
                        <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" />
                        <Input
                            placeholder="Search customers..."
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
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {USER_STATUS_LABELS[status]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                        <Button variant="outline" asChild>
                            <a
                                href={
                                    exportCustomers({
                                        query: {
                                            ...(search && { search }),
                                            ...(filters.status && {
                                                status: filters.status,
                                            }),
                                        },
                                    }).url
                                }
                            >
                                <Download /> Export CSV
                            </a>
                        </Button>

                        <Button asChild>
                            <Link href={create()}>
                                <Plus /> Add Customer
                            </Link>
                        </Button>
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
                                        className="px-3 py-3 font-medium whitespace-nowrap"
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
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium whitespace-nowrap"
                                >
                                    Status
                                </th>
                                <th scope="col" className="w-0 px-3 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.map((customer) => (
                                <tr
                                    key={customer.id}
                                    onClick={() =>
                                        router.visit(show(customer).url)
                                    }
                                    className="group hover:bg-muted/40 border-border/60 cursor-pointer border-b transition-colors"
                                >
                                    <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap tabular-nums">
                                        {customer.id}
                                    </td>
                                    <td className="px-3 py-3.5 font-medium whitespace-nowrap">
                                        {customer.first_name}
                                    </td>
                                    <td className="px-3 py-3.5 whitespace-nowrap">
                                        {customer.last_name}
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap">
                                        {customer.email}
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap">
                                        {customer.last_login_at
                                            ? formatRelativeTime(
                                                  customer.last_login_at,
                                              )
                                            : "—"}
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap">
                                        {formatRelativeTime(
                                            customer.created_at,
                                        )}
                                    </td>
                                    <td className="px-3 py-3.5">
                                        <StatusDot
                                            label={
                                                USER_STATUS_LABELS[
                                                    customer.status
                                                ]
                                            }
                                            dotClassName={
                                                USER_STATUS_DOT[customer.status]
                                            }
                                            muted={customer.status !== "active"}
                                        />
                                    </td>
                                    <td className="px-3 py-3.5">
                                        {/* Revealed on hover for pointer devices;
                                            always visible on touch and when a
                                            control inside has keyboard focus. */}
                                        <div className="flex items-center justify-end gap-0.5 transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                            <Link
                                                href={show(customer)}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`View ${customer.name}`}
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                            <Link
                                                href={edit(customer)}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`Edit ${customer.name}`}
                                            >
                                                <Pencil className="size-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCustomerToDelete(
                                                        customer,
                                                    );
                                                }}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`Delete ${customer.name}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {customers.data.length === 0 && (
                                <TableEmptyRow
                                    colSpan={COLUMNS.length + 2}
                                    icon={UserSearch}
                                    title="No customers found"
                                />
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <PaginationLinks paginated={customers} label="customers" />
                </div>
            </div>

            <ConfirmDialog
                open={customerToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) setCustomerToDelete(null);
                }}
                title={`Delete "${customerToDelete?.name}"?`}
                description="This will remove the customer's access. Their order history is kept and this can be restored later if needed."
                confirmLabel="Delete"
                onConfirm={() => {
                    if (customerToDelete) {
                        router.delete(destroy(customerToDelete).url);
                    }
                }}
            />
        </>
    );
}

AdminCustomersIndex.layout = {
    breadcrumbs: [{ title: "Customers", href: index() }],
};
