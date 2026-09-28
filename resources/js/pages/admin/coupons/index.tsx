import { Head, Link, router, usePage } from "@inertiajs/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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

type Filters = { search?: string; type?: string; status?: string };

export default function AdminCouponsIndex({
    coupons,
    filters,
}: {
    coupons: Paginated<Coupon>;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const { errors } = usePage().props;

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
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Coupons</h1>
                    <Button asChild>
                        <Link href={create()}>
                            <Plus /> New Coupon
                        </Link>
                    </Button>
                </div>

                {errors.coupon && (
                    <p className="text-destructive mt-4 text-sm">
                        {errors.coupon}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
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
                        value={filters.type ?? "all"}
                        onValueChange={(value) =>
                            applyFilters({
                                type: value === "all" ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="percentage">
                                Percentage
                            </SelectItem>
                            <SelectItem value="fixed">Flat amount</SelectItem>
                        </SelectContent>
                    </Select>
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
                </div>

                <div className="mt-6 divide-y rounded-lg border">
                    {coupons.data.map((coupon) => (
                        <div
                            key={coupon.id}
                            className="flex items-center justify-between px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">
                                    {coupon.code}
                                    <span className="text-muted-foreground font-normal">
                                        {" "}
                                        &middot;{" "}
                                        {coupon.type === "percentage"
                                            ? `${coupon.value}%`
                                            : `$${coupon.value}`}{" "}
                                        off
                                    </span>
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Used {coupon.usages_count ?? 0} time
                                    {coupon.usages_count === 1 ? "" : "s"}
                                    {coupon.usage_limit
                                        ? ` of ${coupon.usage_limit}`
                                        : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={
                                        coupon.is_active
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {coupon.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.patch(toggle(coupon).url)
                                    }
                                >
                                    {coupon.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={edit(coupon)}>Edit</Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                `Delete coupon "${coupon.code}"?`,
                                            )
                                        ) {
                                            router.delete(destroy(coupon).url);
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}

                    {coupons.data.length === 0 && (
                        <p className="text-muted-foreground px-4 py-8 text-center text-sm">
                            No coupons found.
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <PaginationLinks paginated={coupons} />
                </div>
            </div>
        </>
    );
}

AdminCouponsIndex.layout = {
    breadcrumbs: [{ title: "Coupons", href: index() }],
};
