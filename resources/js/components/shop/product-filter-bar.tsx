import type { FormDataConvertible } from "@inertiajs/core";
import { router } from "@inertiajs/react";
import { SlidersHorizontal, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import type { CategoryOption, ColorOption, ProductFilters } from "@/types";

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A-Z" },
    { value: "name_desc", label: "Name: Z-A" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
];

export function ProductFilterBar({
    baseUrl,
    filters,
    categories,
    colorOptions,
    children,
}: {
    baseUrl: string;
    filters: ProductFilters;
    categories?: CategoryOption[];
    colorOptions: ColorOption[];
    children: ReactNode;
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [minPrice, setMinPrice] = useState(filters.min_price ?? "");
    const [maxPrice, setMaxPrice] = useState(filters.max_price ?? "");
    const [category, setCategory] = useState(filters.category ?? "all");
    const [color, setColor] = useState<string[]>(filters.color ?? []);
    const [availability, setAvailability] = useState(
        filters.availability ?? "all",
    );
    const [sort, setSort] = useState(filters.sort ?? "featured");
    const isFirstRender = useRef(true);
    const submitRef =
        useRef<(overrides?: Record<string, FormDataConvertible>) => void>(null);

    const submit = (overrides: Record<string, FormDataConvertible> = {}) => {
        const params: Record<string, FormDataConvertible> = {
            search: search || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            category: category !== "all" ? category : undefined,
            color: color.length > 0 ? color : undefined,
            availability: availability !== "all" ? availability : undefined,
            sort,
            ...overrides,
        };

        router.get(baseUrl, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        submitRef.current = submit;
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => submitRef.current?.(), 400);
        return () => clearTimeout(timeout);
    }, [search, minPrice, maxPrice]);

    const toggleColor = (label: string) => {
        const next = color.includes(label)
            ? color.filter((c) => c !== label)
            : [...color, label];
        setColor(next);
        submit({ color: next.length > 0 ? next : undefined });
    };

    const clearAll = () => {
        setSearch("");
        setMinPrice("");
        setMaxPrice("");
        setCategory("all");
        setColor([]);
        setAvailability("all");
        setSort("featured");
        router.get(
            baseUrl,
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const hasActiveFilters =
        search ||
        minPrice ||
        maxPrice ||
        category !== "all" ||
        color.length > 0 ||
        availability !== "all";

    const fields = (
        <div className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="product-search">Search</Label>
                <Input
                    id="product-search"
                    placeholder="Name, SKU, description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {categories && (
                <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select
                        value={category}
                        onValueChange={(value) => {
                            setCategory(value);
                            submit({
                                category: value !== "all" ? value : undefined,
                            });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem
                                    key={c.id}
                                    value={c.slug ?? String(c.id)}
                                >
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="grid gap-2">
                <Label>Price Range</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>
            </div>

            {colorOptions.length > 0 && (
                <div className="grid gap-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                        {colorOptions.map((c) => (
                            <button
                                key={c.label}
                                type="button"
                                onClick={() => toggleColor(c.label)}
                                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                                    color.includes(c.label)
                                        ? "border-primary bg-primary/10"
                                        : "border-input"
                                }`}
                            >
                                {c.hex_color && (
                                    <span
                                        className="size-3 rounded-full border"
                                        style={{ backgroundColor: c.hex_color }}
                                    />
                                )}
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-2">
                <Label>Availability</Label>
                <Select
                    value={availability}
                    onValueChange={(value) => {
                        setAvailability(value);
                        submit({
                            availability: value !== "all" ? value : undefined,
                        });
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="out_of_stock">
                            Out of Stock
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="w-full"
                >
                    <X /> Clear All Filters
                </Button>
            )}
        </div>
    );

    return (
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:items-start lg:gap-8">
            <div className="hidden lg:block">{fields}</div>

            <div>
                <div className="flex items-center justify-between gap-3">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <SlidersHorizontal /> Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="overflow-y-auto p-4"
                            >
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="mt-4">{fields}</div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Label
                            htmlFor="product-sort"
                            className="text-sm whitespace-nowrap"
                        >
                            Sort by
                        </Label>
                        <Select
                            value={sort}
                            onValueChange={(value) => {
                                setSort(value);
                                submit({ sort: value });
                            }}
                        >
                            <SelectTrigger id="product-sort" className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
}
