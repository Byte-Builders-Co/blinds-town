import { useForm } from "@inertiajs/react";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { store, update } from "@/routes/admin/categories";
import type { Category } from "@/types";

export type CategoryDrawerTarget = {
    /** Unique per opening, so the form remounts with fresh values. */
    key: string;
    /** The category being edited, or null when adding a new one. */
    category: Category | null;
    /** Preselected parent when adding a subcategory. */
    parentId: number | null;
};

type FormData = {
    name: string;
    parent_id: string;
    sort_order: string;
    description: string;
    is_active: boolean;
    is_featured: boolean;
    show_in_menu: boolean;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
};

const NO_PARENT = "none";

function ToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onChange}
                aria-label={label}
            />
        </div>
    );
}

function DrawerForm({
    target,
    categories,
    onClose,
}: {
    target: CategoryDrawerTarget;
    categories: Category[];
    onClose: () => void;
}) {
    const { category, parentId } = target;
    const [seoOpen, setSeoOpen] = useState(false);

    const nextOrder = (forParentId: number | null) =>
        categories
            .filter((item) => (item.parent_id ?? null) === forParentId)
            .reduce((max, item) => Math.max(max, item.sort_order + 1), 0);

    const form = useForm<FormData>({
        name: category?.name ?? "",
        parent_id: String(category?.parent_id ?? parentId ?? NO_PARENT),
        sort_order: String(category?.sort_order ?? nextOrder(parentId)),
        description: category?.description ?? "",
        is_active: category?.is_active ?? true,
        is_featured: category?.is_featured ?? false,
        show_in_menu: category?.show_in_menu ?? true,
        meta_title: category?.meta_title ?? "",
        meta_description: category?.meta_description ?? "",
        meta_keywords: category?.meta_keywords ?? "",
    });

    // Only top-level categories can be parents, and a category can't sit under
    // itself. One that already has subcategories must stay top-level.
    const parentOptions = categories.filter(
        (item) => item.parent_id === null && item.id !== category?.id,
    );
    const hasChildren = (category?.children_count ?? 0) > 0;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            sort_order: Number(data.sort_order) || 0,
        }));

        const options = { preserveScroll: true, onSuccess: onClose };

        if (category) {
            form.put(update(category).url, options);
        } else {
            form.post(store().url, options);
        }
    };

    return (
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
                <div className="grid gap-2">
                    <Label htmlFor="category-name">
                        Category Name{" "}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="category-name"
                        value={form.data.name}
                        placeholder="e.g. Blackout Roller Shades"
                        maxLength={255}
                        autoFocus
                        required
                        onChange={(e) => form.setData("name", e.target.value)}
                    />
                    <InputError message={form.errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category-parent">Parent Category</Label>
                    <Select
                        value={form.data.parent_id}
                        onValueChange={(value) =>
                            form.setData("parent_id", value)
                        }
                        disabled={hasChildren}
                    >
                        <SelectTrigger id="category-parent" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_PARENT}>
                                None (Top-level category)
                            </SelectItem>
                            {parentOptions.map((option) => (
                                <SelectItem
                                    key={option.id}
                                    value={String(option.id)}
                                >
                                    {option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {hasChildren && (
                        <p className="text-muted-foreground text-xs">
                            This category has subcategories, so it stays
                            top-level.
                        </p>
                    )}
                    <InputError message={form.errors.parent_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category-order">Display Order</Label>
                    <Input
                        id="category-order"
                        type="number"
                        min={0}
                        value={form.data.sort_order}
                        onChange={(e) =>
                            form.setData("sort_order", e.target.value)
                        }
                    />
                    <InputError message={form.errors.sort_order} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category-description">
                        Category Description
                    </Label>
                    <Textarea
                        id="category-description"
                        rows={3}
                        value={form.data.description}
                        placeholder="Provide a concise description of this category..."
                        onChange={(e) =>
                            form.setData("description", e.target.value)
                        }
                    />
                    <InputError message={form.errors.description} />
                </div>

                <div className="divide-y rounded-md border px-4">
                    <ToggleRow
                        label="Active"
                        description="Visible to customers in the catalog"
                        checked={form.data.is_active}
                        onChange={(checked) =>
                            form.setData("is_active", checked)
                        }
                    />
                    <ToggleRow
                        label="Featured Category"
                        description="Highlight in homepage curated collections"
                        checked={form.data.is_featured}
                        onChange={(checked) =>
                            form.setData("is_featured", checked)
                        }
                    />
                    <ToggleRow
                        label="Show in Menu"
                        description="Display in main header navigation"
                        checked={form.data.show_in_menu}
                        onChange={(checked) =>
                            form.setData("show_in_menu", checked)
                        }
                    />
                </div>

                <Collapsible
                    open={seoOpen}
                    onOpenChange={setSeoOpen}
                    className="rounded-md border"
                >
                    <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
                        <span className="flex items-center gap-2">
                            <Search className="text-muted-foreground size-4" />
                            Advanced SEO
                        </span>
                        <ChevronDown
                            className={cn(
                                "text-muted-foreground size-4 transition-transform",
                                seoOpen && "rotate-180",
                            )}
                        />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 border-t p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category-meta-title">
                                SEO Title
                            </Label>
                            <Input
                                id="category-meta-title"
                                value={form.data.meta_title}
                                maxLength={255}
                                onChange={(e) =>
                                    form.setData("meta_title", e.target.value)
                                }
                            />
                            <InputError message={form.errors.meta_title} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category-meta-description">
                                Meta Description
                            </Label>
                            <Textarea
                                id="category-meta-description"
                                rows={3}
                                maxLength={500}
                                value={form.data.meta_description}
                                onChange={(e) =>
                                    form.setData(
                                        "meta_description",
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={form.errors.meta_description}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category-meta-keywords">
                                Meta Keywords
                            </Label>
                            <Input
                                id="category-meta-keywords"
                                value={form.data.meta_keywords}
                                maxLength={255}
                                onChange={(e) =>
                                    form.setData(
                                        "meta_keywords",
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.meta_keywords} />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing && <Spinner />}
                    Save Category
                </Button>
            </div>
        </form>
    );
}

export function CategoryDrawer({
    target,
    categories,
    onClose,
}: {
    target: CategoryDrawerTarget | null;
    categories: Category[];
    onClose: () => void;
}) {
    const title = target?.category
        ? `Edit Category: ${target.category.name}`
        : target?.parentId
          ? "Add Subcategory"
          : "Add Category";

    return (
        <Sheet
            open={target !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b p-6 pr-12">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription className="sr-only">
                        Category details, visibility and SEO settings.
                    </SheetDescription>
                </SheetHeader>

                {/* Keyed so the form starts fresh each time the drawer opens. */}
                {target && (
                    <DrawerForm
                        key={target.key}
                        target={target}
                        categories={categories}
                        onClose={onClose}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}
