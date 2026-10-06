import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ChevronDown,
    ChevronRight,
    Copy,
    CornerDownRight,
    Eye,
    MoreHorizontal,
    Plus,
    Power,
    RotateCcw,
    Search,
    Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryDrawer } from "@/components/admin/category-drawer";
import type { CategoryDrawerTarget } from "@/components/admin/category-drawer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { show } from "@/routes/categories";
import { destroy, duplicate, index, toggle } from "@/routes/admin/categories";
import type { Category } from "@/types";

type StatusFilter = "all" | "active" | "inactive";

type Row = { category: Category; depth: 0 | 1 };

function StatusPill({ active }: { active: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                active
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-500/10 text-slate-700 dark:text-slate-300",
            )}
        >
            <span
                className="size-1.5 shrink-0 rounded-full bg-current"
                aria-hidden="true"
            />
            {active ? "Active" : "Inactive"}
        </span>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <Card className="gap-1 rounded-md px-5 py-4 shadow-xs">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {label}
            </p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </Card>
    );
}

export default function AdminCategoriesIndex({
    categories,
}: {
    categories: Category[];
}) {
    const { auth, errors } = usePage().props;
    const canCreate = auth.permissions.includes("categories.create");
    const canEdit = auth.permissions.includes("categories.edit");
    const canDelete = auth.permissions.includes("categories.delete");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [parent, setParent] = useState("all");
    const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
    const [drawer, setDrawer] = useState<CategoryDrawerTarget | null>(null);
    const [deleting, setDeleting] = useState<Category | null>(null);

    const parents = useMemo(
        () => categories.filter((category) => category.parent_id === null),
        [categories],
    );

    const childrenOf = useMemo(() => {
        const map = new Map<number, Category[]>();

        for (const category of categories) {
            if (category.parent_id !== null) {
                map.set(category.parent_id, [
                    ...(map.get(category.parent_id) ?? []),
                    category,
                ]);
            }
        }

        return map;
    }, [categories]);

    const stats = {
        total: categories.length,
        active: categories.filter((category) => category.is_active).length,
        mapped: categories.reduce(
            (sum, category) => sum + (category.products_count ?? 0),
            0,
        ),
    };

    // A parent's badge counts its own products plus its subcategories', as the
    // storefront category page lists them together.
    const productsIn = (category: Category) =>
        (category.products_count ?? 0) +
        (childrenOf.get(category.id) ?? []).reduce(
            (sum, child) => sum + (child.products_count ?? 0),
            0,
        );

    const query = search.trim().toLowerCase();
    const filtering = query !== "" || status !== "all" || parent !== "all";

    const rows = useMemo(() => {
        const matches = (category: Category) =>
            (query === "" ||
                category.name.toLowerCase().includes(query) ||
                category.slug.toLowerCase().includes(query)) &&
            (status === "all" || category.is_active === (status === "active"));

        const result: Row[] = [];

        for (const top of parents) {
            const kids =
                parent === "top-level"
                    ? []
                    : (childrenOf.get(top.id) ?? []).filter(
                          (kid) =>
                              matches(kid) &&
                              (parent === "all" || parent === String(top.id)),
                      );

            const topMatches =
                parent === "all" || parent === "top-level"
                    ? matches(top)
                    : parent === String(top.id);

            // A parent stays on screen as context when only a child matches.
            if (!topMatches && kids.length === 0) continue;

            result.push({ category: top, depth: 0 });

            if (filtering || !collapsed.has(top.id)) {
                result.push(
                    ...kids.map((kid) => ({
                        category: kid,
                        depth: 1 as const,
                    })),
                );
            }
        }

        return result;
    }, [parents, childrenOf, query, status, parent, filtering, collapsed]);

    const resetFilters = () => {
        setSearch("");
        setStatus("all");
        setParent("all");
    };

    const toggleCollapsed = (id: number) =>
        setCollapsed((current) => {
            const next = new Set(current);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });

    const openDrawer = (category: Category | null, parentId: number | null) =>
        setDrawer({
            key: `${category?.id ?? "new"}-${Date.now()}`,
            category,
            parentId,
        });

    return (
        <>
            <Head title="Categories" />

            <div className="space-y-5 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Category Management
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage product categories, hierarchy, visibility and
                            storefront organization.
                        </p>
                    </div>
                    {canCreate && (
                        <Button onClick={() => openDrawer(null, null)}>
                            <Plus /> Add Category
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Total Categories" value={stats.total} />
                    <StatCard label="Active Categories" value={stats.active} />
                    <StatCard label="Products Mapped" value={stats.mapped} />
                </div>

                {errors.category && (
                    <p className="text-destructive text-sm">
                        {errors.category}
                    </p>
                )}

                <div className="bg-card flex flex-wrap items-center gap-2 rounded-md border p-3">
                    <div className="relative min-w-52 flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" />
                        <Input
                            placeholder="Search category name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <Select
                        value={status}
                        onValueChange={(value) =>
                            setStatus(value as StatusFilter)
                        }
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={parent} onValueChange={setParent}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Parents</SelectItem>
                            <SelectItem value="top-level">
                                Top-level only
                            </SelectItem>
                            {parents.map((top) => (
                                <SelectItem key={top.id} value={String(top.id)}>
                                    Under {top.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={resetFilters}>
                        <RotateCcw /> Reset
                    </Button>
                </div>

                <div className="bg-card overflow-x-auto rounded-md border">
                    <table className="w-full min-w-4xl text-left text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b text-xs tracking-wider uppercase">
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-medium"
                                >
                                    Category
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-medium"
                                >
                                    Parent Category
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-medium"
                                >
                                    Products
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-medium"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-right font-medium"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ category, depth }) => {
                                const kids = childrenOf.get(category.id) ?? [];
                                const isOpen = !collapsed.has(category.id);

                                return (
                                    <tr
                                        key={category.id}
                                        className={cn(
                                            "hover:bg-muted/40 border-b transition-colors last:border-b-0",
                                            depth === 1 && "bg-muted/20",
                                        )}
                                    >
                                        <td className="px-4 py-3">
                                            <div
                                                className={cn(
                                                    "flex items-center gap-2",
                                                    depth === 1 && "pl-7",
                                                )}
                                            >
                                                {depth === 1 ? (
                                                    <CornerDownRight className="text-muted-foreground/60 size-3.5 shrink-0" />
                                                ) : kids.length > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleCollapsed(
                                                                category.id,
                                                            )
                                                        }
                                                        className="text-muted-foreground hover:text-foreground -ml-1 rounded p-0.5"
                                                        aria-label={`${isOpen ? "Collapse" : "Expand"} ${category.name}`}
                                                        aria-expanded={isOpen}
                                                    >
                                                        {isOpen ? (
                                                            <ChevronDown className="size-4" />
                                                        ) : (
                                                            <ChevronRight className="size-4" />
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="size-4 shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-semibold">
                                                        {category.name}
                                                    </p>
                                                    <p className="text-muted-foreground font-mono text-xs">
                                                        /{category.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                            {category.parent?.name ??
                                                "— (Root)"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-muted text-muted-foreground inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums">
                                                {productsIn(category)}{" "}
                                                {productsIn(category) === 1
                                                    ? "product"
                                                    : "products"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusPill
                                                active={category.is_active}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {canCreate && depth === 0 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openDrawer(
                                                                null,
                                                                category.id,
                                                            )
                                                        }
                                                    >
                                                        <Plus /> Subcategory
                                                    </Button>
                                                )}
                                                {canEdit && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openDrawer(
                                                                category,
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            aria-label={`More actions for ${category.name}`}
                                                        >
                                                            <MoreHorizontal />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={show(
                                                                    category.slug,
                                                                )}
                                                                target="_blank"
                                                            >
                                                                <Eye /> View
                                                                Category
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {canCreate && (
                                                            <DropdownMenuItem
                                                                onSelect={() =>
                                                                    router.post(
                                                                        duplicate(
                                                                            category,
                                                                        ).url,
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <Copy />{" "}
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canEdit && (
                                                            <DropdownMenuItem
                                                                onSelect={() =>
                                                                    router.patch(
                                                                        toggle(
                                                                            category,
                                                                        ).url,
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <Power />
                                                                {category.is_active
                                                                    ? "Deactivate"
                                                                    : "Activate"}
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDelete && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onSelect={() =>
                                                                        setDeleting(
                                                                            category,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 />{" "}
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-muted-foreground px-4 py-12 text-center"
                                    >
                                        No categories match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CategoryDrawer
                target={drawer}
                categories={categories}
                onClose={() => setDrawer(null)}
            />

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Delete "${deleting?.name}"?`}
                description="This cannot be undone. A category that still has subcategories or products can't be deleted."
                confirmLabel="Delete"
                onConfirm={() => {
                    if (deleting) {
                        router.delete(destroy(deleting).url, {
                            preserveScroll: true,
                        });
                    }

                    setDeleting(null);
                }}
            />
        </>
    );
}

AdminCategoriesIndex.layout = {
    breadcrumbs: [{ title: "Categories", href: index() }],
};
