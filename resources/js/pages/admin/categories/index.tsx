import { Head, Link, router, usePage } from "@inertiajs/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PaginationLinks } from "@/components/pagination-links";
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
import { create, destroy, edit, index } from "@/routes/admin/categories";
import type { Category, CategoryOption, Paginated } from "@/types";

type Filters = {
    search?: string;
    status?: string;
    parent?: string;
    featured?: string;
};

export default function AdminCategoriesIndex({
    categories,
    parentOptions,
    filters,
}: {
    categories: Paginated<Category>;
    parentOptions: CategoryOption[];
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
            <Head title="Categories" />

            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Categories</h1>
                    <Button asChild>
                        <Link href={create()}>
                            <Plus /> New Category
                        </Link>
                    </Button>
                </div>

                {errors.category && (
                    <p className="text-destructive mt-4 text-sm">
                        {errors.category}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                    <Input
                        placeholder="Search categories..."
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
                    <Select
                        value={filters.parent ?? "all"}
                        onValueChange={(value) =>
                            applyFilters({
                                parent: value === "all" ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Parent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            <SelectItem value="top-level">
                                Top-level only
                            </SelectItem>
                            {parentOptions.map((option) => (
                                <SelectItem
                                    key={option.id}
                                    value={option.id.toString()}
                                >
                                    Under {option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.featured ?? "all"}
                        onValueChange={(value) =>
                            applyFilters({
                                featured: value === "all" ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Featured" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="1">Featured only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="mt-6 divide-y rounded-lg border">
                    {categories.data.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center justify-between px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">
                                    {category.name}
                                    {category.parent && (
                                        <span className="text-muted-foreground font-normal">
                                            {" "}
                                            &middot; under{" "}
                                            {category.parent.name}
                                        </span>
                                    )}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {category.products_count} product
                                    {category.products_count === 1 ? "" : "s"}
                                    {" · "}
                                    {category.children_count} subcategor
                                    {category.children_count === 1
                                        ? "y"
                                        : "ies"}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {category.is_featured && (
                                    <Badge variant="outline">Featured</Badge>
                                )}
                                <Badge
                                    variant={
                                        category.is_active
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {category.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={edit(category)}>Edit</Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                `Delete "${category.name}"?`,
                                            )
                                        ) {
                                            router.delete(
                                                destroy(category).url,
                                            );
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <PaginationLinks paginated={categories} />
                </div>
            </div>
        </>
    );
}

AdminCategoriesIndex.layout = {
    breadcrumbs: [{ title: "Categories", href: index() }],
};
