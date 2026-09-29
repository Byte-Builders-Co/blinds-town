import { Head, Link, router } from "@inertiajs/react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationLinks } from "@/components/pagination-links";
import { StockStatusBadge } from "@/components/shop/stock-status-badge";
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
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { create, destroy, edit, index, show } from "@/routes/admin/products";
import { STOCK_STATUS_LABELS } from "@/types";
import type { Paginated, Product, StockStatus } from "@/types";

type SortColumn =
    | "id"
    | "name"
    | "category"
    | "price"
    | "stock"
    | "status"
    | "updated_at";

type Filters = {
    search?: string;
    sort?: string;
    direction?: string;
    stock_status?: string;
    status?: string;
};

const COLUMNS: { key: SortColumn; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price" },
    { key: "stock", label: "Stock" },
    { key: "status", label: "Status" },
    { key: "updated_at", label: "Updated" },
];

export default function AdminProductsIndex({
    products,
    stockStatuses,
    filters,
}: {
    products: Paginated<Product>;
    stockStatuses: StockStatus[];
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [productToDelete, setProductToDelete] = useState<Product | null>(
        null,
    );

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
            <Head title="Products" />

            <div className="p-4 md:p-4">
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        <Select
                            value={filters.stock_status ?? "all"}
                            onValueChange={(value) =>
                                applyFilters({
                                    stock_status:
                                        value === "all" ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stock</SelectItem>
                                {stockStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {STOCK_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

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
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button asChild>
                            <Link href={create()}>
                                <Plus /> Add Product
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-4 rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/40 text-muted-foreground border-b text-left">
                                    <th className="px-4 py-3 font-medium">
                                        Thumbnail
                                    </th>
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
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        onClick={() =>
                                            router.visit(show(product).url)
                                        }
                                        className="hover:bg-accent/50 cursor-pointer"
                                    >
                                        <td className="px-4 py-3">
                                            {product.image_path ? (
                                                <img
                                                    src={`/storage/${product.image_path}`}
                                                    alt={product.name}
                                                    className="size-10 rounded-md border object-cover"
                                                />
                                            ) : (
                                                <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-md border text-[10px]">
                                                    No image
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {product.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {product.name}
                                                </span>
                                                {product.is_featured && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                            {product.category?.name ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {product.sale_price !== null ? (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="font-medium">
                                                        {formatCurrency(
                                                            product.sale_price,
                                                        )}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs line-through">
                                                        {formatCurrency(
                                                            product.base_price,
                                                        )}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        product.base_price,
                                                    )}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StockStatusBadge
                                                status={product.stock_status}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
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
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                            {product.updated_at
                                                ? formatRelativeTime(
                                                      product.updated_at,
                                                  )
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={show(product)}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md"
                                                    aria-label={`View ${product.name}`}
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                                <Link
                                                    href={edit(product)}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md"
                                                    aria-label={`Edit ${product.name}`}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setProductToDelete(
                                                            product,
                                                        );
                                                    }}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-accent inline-flex size-8 items-center justify-center rounded-md"
                                                    aria-label={`Delete ${product.name}`}
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={COLUMNS.length + 2}
                                            className="text-muted-foreground px-4 py-10 text-center"
                                        >
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4">
                    <PaginationLinks paginated={products} label="products" />
                </div>
            </div>

            <ConfirmDialog
                open={productToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) setProductToDelete(null);
                }}
                title={`Delete "${productToDelete?.name}"?`}
                description="This will remove the product from the catalog. It can be restored later if needed."
                confirmLabel="Delete"
                onConfirm={() => {
                    if (productToDelete) {
                        router.delete(destroy(productToDelete).url);
                    }
                }}
            />
        </>
    );
}

AdminProductsIndex.layout = {
    breadcrumbs: [{ title: "Products", href: index() }],
};
