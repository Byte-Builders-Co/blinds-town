import { Head, Link, router } from "@inertiajs/react";
import {
    Eye,
    ImageOff,
    PackageSearch,
    Pencil,
    Plus,
    Search,
    Star,
    Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StatusDot } from "@/components/admin/status-dot";
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
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { create, destroy, edit, index, show } from "@/routes/admin/products";
import { STOCK_STATUS_LABELS } from "@/types";
import type { Paginated, Product, StockStatus } from "@/types";

type SortColumn =
    "id" | "name" | "category" | "price" | "stock" | "status" | "updated_at";

type Filters = {
    search?: string;
    sort?: string;
    direction?: string;
    stock_status?: string;
    status?: string;
};

const COLUMNS: { key: SortColumn; label: string; align?: "right" }[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Product" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price", align: "right" },
    { key: "stock", label: "Stock" },
    { key: "status", label: "Status" },
    { key: "updated_at", label: "Updated" },
];

// The controller sorts by name ascending when no sort is requested.
const DEFAULT_SORT: SortColumn = "name";

const STOCK_DOT: Record<StockStatus, string> = {
    in_stock: "bg-blue-500",
    out_of_stock: "bg-red-500",
    made_to_order: "bg-amber-500",
};

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

    const activeSort = filters.sort ?? DEFAULT_SORT;
    const activeDirection = filters.direction === "desc" ? "desc" : "asc";

    const toggleSort = (column: SortColumn) => {
        const direction =
            activeSort === column && activeDirection === "asc" ? "desc" : "asc";
        applyFilters({ sort: column, direction });
    };

    return (
        <>
            <Head title="Products" />

            <div className="p-4 md:p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-72">
                        <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" />
                        <Input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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
                                    status: value === "all" ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button asChild className="sm:ml-auto">
                        <Link href={create()}>
                            <Plus /> Add Product
                        </Link>
                    </Button>
                </div>

                {/* Open table: no outer box, just hairline dividers. The negative
                    margin lets row hover backgrounds bleed past the text edge so
                    content still lines up with the toolbar above. */}
                <div className="-mx-3 mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
                                {COLUMNS.map((column) => {
                                    const isActive = activeSort === column.key;

                                    return (
                                        <th
                                            key={column.key}
                                            scope="col"
                                            aria-sort={
                                                isActive
                                                    ? activeDirection === "desc"
                                                        ? "descending"
                                                        : "ascending"
                                                    : "none"
                                            }
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
                                                className={cn(
                                                    "hover:text-foreground focus-visible:ring-ring/50 -mx-1.5 rounded px-1.5 py-0.5 uppercase transition-colors outline-none focus-visible:ring-2",
                                                    isActive &&
                                                        "text-foreground",
                                                )}
                                            >
                                                {column.label}
                                            </button>
                                        </th>
                                    );
                                })}
                                <th scope="col" className="w-0 px-3 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.map((product) => (
                                <tr
                                    key={product.id}
                                    onClick={() =>
                                        router.visit(show(product).url)
                                    }
                                    className="group hover:bg-muted/40 border-border/60 cursor-pointer border-b transition-colors"
                                >
                                    <td className="text-muted-foreground px-3 py-3 whitespace-nowrap tabular-nums">
                                        {product.id}
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            {product.image_path ? (
                                                <img
                                                    src={`/storage/${product.image_path}`}
                                                    alt=""
                                                    loading="lazy"
                                                    className="ring-border size-11 shrink-0 rounded-lg object-cover ring-1"
                                                />
                                            ) : (
                                                <div className="bg-muted text-muted-foreground/60 flex size-11 shrink-0 items-center justify-center rounded-lg">
                                                    <ImageOff className="size-4" />
                                                </div>
                                            )}
                                            <div className="flex min-w-0 items-center gap-1.5">
                                                <span
                                                    className="max-w-80 truncate font-medium"
                                                    title={product.name}
                                                >
                                                    {product.name}
                                                </span>
                                                {product.is_featured && (
                                                    <span title="Featured">
                                                        <Star
                                                            className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="sr-only">
                                                            Featured
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">
                                        {product.category?.name ?? "—"}
                                    </td>
                                    <td className="px-3 py-3 text-right whitespace-nowrap tabular-nums">
                                        {product.sale_price !== null ? (
                                            <span className="inline-flex items-baseline justify-end gap-1.5">
                                                <span className="text-muted-foreground text-xs line-through">
                                                    {formatCurrency(
                                                        product.base_price,
                                                    )}
                                                </span>
                                                <span className="font-semibold">
                                                    {formatCurrency(
                                                        product.sale_price,
                                                    )}
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    product.base_price,
                                                )}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        <StatusDot
                                            label={
                                                STOCK_STATUS_LABELS[
                                                    product.stock_status
                                                ]
                                            }
                                            dotClassName={
                                                STOCK_DOT[product.stock_status]
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-3">
                                        <StatusDot
                                            label={
                                                product.is_active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            dotClassName={
                                                product.is_active
                                                    ? "bg-emerald-500"
                                                    : "bg-slate-400"
                                            }
                                            muted={!product.is_active}
                                        />
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">
                                        {product.updated_at
                                            ? formatRelativeTime(
                                                  product.updated_at,
                                              )
                                            : "—"}
                                    </td>
                                    <td className="px-3 py-3">
                                        {/* Revealed on hover for pointer devices;
                                            always visible on touch and when a
                                            control inside has keyboard focus. */}
                                        <div className="flex items-center justify-end gap-0.5 transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                            <Link
                                                href={show(product)}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`View ${product.name}`}
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                            <Link
                                                href={edit(product)}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`Edit ${product.name}`}
                                            >
                                                <Pencil className="size-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProductToDelete(product);
                                                }}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`Delete ${product.name}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <TableEmptyRow
                                    colSpan={COLUMNS.length + 1}
                                    icon={PackageSearch}
                                    title="No products found"
                                />
                            )}
                        </tbody>
                    </table>
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
