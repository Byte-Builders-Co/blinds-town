import { Head, Link, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, Power, PowerOff, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { StatusDot } from "@/components/admin/status-dot";
import { TableEmptyRow } from "@/components/admin/table-empty-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PaginationLinks } from "@/components/pagination-links";
import { create, destroy, edit, index, toggle } from "@/routes/admin/coupons";
import type { Coupon, Paginated } from "@/types";

type Filters = { search?: string; status?: string };

export default function AdminCouponsIndex({
    coupons,
    filters,
}: {
    coupons: Paginated<Coupon>;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const { errors } = usePage().props;
    const [deleting, setDeleting] = useState<Coupon | null>(null);

    const applyFilters = (patch: Partial<Filters>) => {
        router.get(
            index().url,
            { ...filters, search, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Coupons" />

            <div className="p-4">
                {errors.coupon && (
                    <p className="text-destructive mt-4 text-sm">
                        {errors.coupon}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Search by code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") applyFilters({});
                        }}
                        onBlur={() => applyFilters({})}
                        className="max-w-xs"
                    />
                    <Select
                        value={filters.status ?? "all"}
                        onValueChange={(value) =>
                            applyFilters({
                                status: value === "all" ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button asChild className="ml-auto">
                        <Link href={create()}>
                            <Plus /> New Coupon
                        </Link>
                    </Button>
                </div>

                {/* Open table: no outer box, just hairline dividers. The negative
                    margin lets row hover backgrounds bleed past the text edge so
                    content still lines up with the toolbar above. */}
                <div className="-mx-3 mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b text-xs tracking-wider uppercase">
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Coupon
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Usage
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Status
                                </th>
                                <th scope="col" className="w-0 px-3 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.data.map((coupon) => (
                                <tr
                                    key={coupon.id}
                                    className="group hover:bg-muted/40 border-border/60 border-b transition-colors"
                                >
                                    <td className="px-3 py-3.5">
                                        <span className="font-medium">
                                            {coupon.code}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {" "}
                                            &middot;{" "}
                                            {coupon.type === "free_shipping"
                                                ? "Free shipping"
                                                : `${
                                                      coupon.type ===
                                                      "percentage"
                                                          ? `${coupon.value}%`
                                                          : `$${coupon.value}`
                                                  } off`}
                                        </span>
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap">
                                        Used {coupon.usages_count ?? 0} time
                                        {coupon.usages_count === 1 ? "" : "s"}
                                        {coupon.usage_limit
                                            ? ` of ${coupon.usage_limit}`
                                            : ""}
                                    </td>
                                    <td className="px-3 py-3.5">
                                        <StatusDot
                                            label={
                                                coupon.is_active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            dotClassName={
                                                coupon.is_active
                                                    ? "bg-emerald-500"
                                                    : "bg-slate-400"
                                            }
                                            muted={!coupon.is_active}
                                        />
                                    </td>
                                    <td className="px-3 py-3.5">
                                        {/* Revealed on hover for pointer devices;
                                            always visible on touch and when a
                                            control inside has keyboard focus. */}
                                        <div className="flex items-center justify-end gap-0.5 transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.patch(
                                                        toggle(coupon).url,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`${coupon.is_active ? "Deactivate" : "Activate"} ${coupon.code}`}
                                                title={
                                                    coupon.is_active
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }
                                            >
                                                {coupon.is_active ? (
                                                    <PowerOff className="size-4" />
                                                ) : (
                                                    <Power className="size-4" />
                                                )}
                                            </button>
                                            <Link
                                                href={edit(coupon)}
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`Edit ${coupon.code}`}
                                                title="Edit"
                                            >
                                                <Pencil className="size-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleting(coupon)
                                                }
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`Delete ${coupon.code}`}
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {coupons.data.length === 0 && (
                                <TableEmptyRow
                                    colSpan={4}
                                    icon={Ticket}
                                    title="No coupons found"
                                />
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <PaginationLinks paginated={coupons} label="coupons" />
                </div>
            </div>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Delete coupon "${deleting?.code}"?`}
                description="This cannot be undone."
                confirmLabel="Delete"
                onConfirm={() => {
                    if (deleting) {
                        router.delete(destroy(deleting).url);
                    }

                    setDeleting(null);
                }}
            />
        </>
    );
}

AdminCouponsIndex.layout = {
    breadcrumbs: [{ title: "Coupons", href: index() }],
};
