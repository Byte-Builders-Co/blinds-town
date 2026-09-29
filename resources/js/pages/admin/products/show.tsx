import { Head, Link, router } from "@inertiajs/react";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StockStatusBadge } from "@/components/shop/stock-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { destroy, edit, index } from "@/routes/admin/products";
import { OPTION_GROUP_KIND_LABELS, PRICING_TIER_TYPE_LABELS } from "@/types";
import type { Product } from "@/types";

export default function AdminProductShow({ product }: { product: Product }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    return (
        <>
            <Head title={product.name} />

            <div className="p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold">{product.name}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild>
                            <Link href={edit(product)}>
                                <Pencil /> Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setConfirmingDelete(true)}
                        >
                            <Trash2 /> Delete
                        </Button>
                    </div>
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        SKU
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {product.sku ?? "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Category
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {product.category?.name ?? "—"}
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-muted-foreground text-sm">
                                        Status
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <Badge
                                            className={cn(
                                                "border-transparent",
                                                product.is_active
                                                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                                            )}
                                        >
                                            {product.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                        {product.is_featured && (
                                            <Badge>Featured</Badge>
                                        )}
                                        <StockStatusBadge
                                            status={product.stock_status}
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-muted-foreground text-sm">
                                        Description
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {product.description ?? "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Width range
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {product.min_width_cm}cm –{" "}
                                        {product.max_width_cm}cm
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Height range
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {product.min_height_cm}cm –{" "}
                                        {product.max_height_cm}cm
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Default measurement unit
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {product.measurement_unit_default ===
                                        "cm"
                                            ? "Centimeters"
                                            : "Inches"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Options</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {product.option_groups &&
                                product.option_groups.length > 0 ? (
                                    product.option_groups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="rounded-lg border p-3"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">
                                                    {group.name}
                                                </p>
                                                <Badge variant="secondary">
                                                    {
                                                        OPTION_GROUP_KIND_LABELS[
                                                            group.kind
                                                        ]
                                                    }
                                                </Badge>
                                                {group.is_required && (
                                                    <Badge variant="outline">
                                                        Required
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {group.values.map((value) => (
                                                    <span
                                                        key={value.id}
                                                        className="bg-muted rounded-md px-2 py-1 text-xs"
                                                    >
                                                        {value.label}
                                                        {Number(
                                                            value.price_modifier,
                                                        ) !== 0 &&
                                                            ` (${Number(value.price_modifier) > 0 ? "+" : ""}${formatCurrency(value.price_modifier)})`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No option groups.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Area Pricing Tiers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.pricing_tiers &&
                                product.pricing_tiers.length > 0 ? (
                                    <div className="divide-y">
                                        {product.pricing_tiers.map((tier) => (
                                            <div
                                                key={tier.id}
                                                className="flex items-center justify-between py-2 text-sm"
                                            >
                                                <span>
                                                    {tier.min_area_sqm} m²
                                                    {tier.max_area_sqm
                                                        ? ` – ${tier.max_area_sqm} m²`
                                                        : "+"}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {
                                                        PRICING_TIER_TYPE_LABELS[
                                                            tier.pricing_type
                                                        ]
                                                    }
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        tier.price,
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No pricing tiers.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Media</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.image_path ? (
                                    <img
                                        src={`/storage/${product.image_path}`}
                                        alt={product.name}
                                        className="aspect-square w-full rounded-md border object-cover"
                                    />
                                ) : (
                                    <div className="bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center rounded-md border text-sm">
                                        No image
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Price per m²
                                    </span>
                                    <span>
                                        {formatCurrency(
                                            product.price_per_sqm,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Base / cutting fee
                                    </span>
                                    <span>
                                        {formatCurrency(product.base_price)}
                                    </span>
                                </div>
                                {product.sale_price !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Sale price
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                product.sale_price,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {product.discount_percent && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Discount
                                        </span>
                                        <span>
                                            {product.discount_percent}%
                                        </span>
                                    </div>
                                )}
                                {product.tax_rate_percent && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Tax rate
                                        </span>
                                        <span>
                                            {product.tax_rate_percent}%
                                        </span>
                                    </div>
                                )}
                                {product.min_area_sqm && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Minimum billable area
                                        </span>
                                        <span>
                                            {product.min_area_sqm} m²
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {product.updated_at && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activity</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {product.created_at && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Created
                                            </span>
                                            <span>
                                                {formatRelativeTime(
                                                    product.created_at,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Last updated
                                        </span>
                                        <span>
                                            {formatRelativeTime(
                                                product.updated_at,
                                            )}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmingDelete}
                onOpenChange={setConfirmingDelete}
                title={`Delete "${product.name}"?`}
                description="This will remove the product from the catalog. It can be restored later if needed."
                confirmLabel="Delete"
                onConfirm={() => router.delete(destroy(product).url)}
            />
        </>
    );
}

AdminProductShow.layout = {
    breadcrumbs: [
        { title: "Products", href: index() },
        { title: "Product", href: "#" },
    ],
};
