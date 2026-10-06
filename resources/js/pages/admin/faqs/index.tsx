import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    CircleHelp,
    Eye,
    FolderPlus,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { StatusDot } from "@/components/admin/status-dot";
import { TableEmptyRow } from "@/components/admin/table-empty-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { destroy, index, store, update } from "@/routes/admin/faqs";
import {
    destroy as destroyCategory,
    store as storeCategory,
} from "@/routes/admin/faqs/categories";
import type { Faq } from "@/types";

type FormData = {
    question: string;
    answer: string;
    category: string;
    sort_order: string;
    is_active: boolean;
};

const DEFAULT_CATEGORY = "General";
const NEW_CATEGORY = "__new__";
const ALL_CATEGORIES = "__all__";

const EMPTY: FormData = {
    question: "",
    answer: "",
    category: "",
    sort_order: "",
    is_active: true,
};

function FaqDialog({
    faq,
    open,
    categories,
    onClose,
}: {
    faq: Faq | null;
    open: boolean;
    categories: string[];
    onClose: () => void;
}) {
    const [creating, setCreating] = useState(false);
    const categoryOptions = Array.from(
        new Set([
            DEFAULT_CATEGORY,
            ...categories,
            ...(faq?.category ? [faq.category] : []),
        ]),
    );
    const form = useForm<FormData>(
        faq
            ? {
                  question: faq.question,
                  answer: faq.answer,
                  category: faq.category ?? "",
                  sort_order: String(faq.sort_order),
                  is_active: faq.is_active,
              }
            : EMPTY,
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = { preserveScroll: true, onSuccess: onClose };

        if (faq) {
            form.put(update(faq.id).url, options);
        } else {
            form.post(store().url, options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {faq ? "Edit question" : "Add a question"}
                    </DialogTitle>
                    <DialogDescription>
                        Shown on your website&apos;s FAQ page as soon as you
                        save.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="question">Question</Label>
                        <Input
                            id="question"
                            value={form.data.question}
                            onChange={(e) =>
                                form.setData("question", e.target.value)
                            }
                            required
                            autoFocus
                        />
                        <InputError message={form.errors.question} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="answer">Answer</Label>
                        <Textarea
                            id="answer"
                            rows={6}
                            value={form.data.answer}
                            onChange={(e) =>
                                form.setData("answer", e.target.value)
                            }
                            required
                        />
                        <p className="text-muted-foreground text-xs">
                            Leave a blank line between paragraphs. Use **bold**
                            for emphasis and start lines with &quot;- &quot; for
                            a bullet list.
                        </p>
                        <InputError message={form.errors.answer} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={
                                    creating
                                        ? NEW_CATEGORY
                                        : form.data.category || DEFAULT_CATEGORY
                                }
                                onValueChange={(value) => {
                                    if (value === NEW_CATEGORY) {
                                        setCreating(true);
                                        form.setData("category", "");
                                    } else {
                                        setCreating(false);
                                        form.setData("category", value);
                                    }
                                }}
                            >
                                <SelectTrigger id="category" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value={NEW_CATEGORY}>
                                        + Create new category
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {creating && (
                                <Input
                                    aria-label="New category name"
                                    value={form.data.category}
                                    placeholder="New category name"
                                    maxLength={100}
                                    autoFocus
                                    onChange={(e) =>
                                        form.setData("category", e.target.value)
                                    }
                                />
                            )}
                            <InputError message={form.errors.category} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sort_order">Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={form.data.sort_order}
                                placeholder="Adds to the end"
                                onChange={(e) =>
                                    form.setData("sort_order", e.target.value)
                                }
                            />
                            <InputError message={form.errors.sort_order} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData("is_active", checked === true)
                            }
                        />
                        <Label htmlFor="is_active">Show on the website</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            {faq ? "Save changes" : "Add question"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CategoryDialog({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({ name: "" });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(storeCategory().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a category</DialogTitle>
                    <DialogDescription>
                        Categories group questions on your FAQ page. Once
                        created, pick it when adding a question.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category-name">Category name</Label>
                        <Input
                            id="category-name"
                            value={form.data.name}
                            maxLength={100}
                            placeholder="e.g. Shipping"
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                            required
                            autoFocus
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Add category
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminFaqsIndex({
    faqs,
    categories,
}: {
    faqs: Faq[];
    categories: string[];
}) {
    const { auth } = usePage().props;
    const canManage = auth.permissions.includes("settings.manage");

    // `dialog` holds which question is open: undefined = closed, null = new.
    const [dialog, setDialog] = useState<Faq | null | undefined>(undefined);
    const [deleting, setDeleting] = useState<Faq | null>(null);
    const [viewing, setViewing] = useState<Faq | null>(null);
    const [addingCategory, setAddingCategory] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<string | null>(
        null,
    );
    const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);

    const categoryOf = (faq: Faq) => faq.category ?? DEFAULT_CATEGORY;
    const filterOptions = Array.from(
        new Set([DEFAULT_CATEGORY, ...categories, ...faqs.map(categoryOf)]),
    );
    const countIn = (category: string) =>
        faqs.filter((faq) => categoryOf(faq) === category).length;
    const visibleFaqs =
        categoryFilter === ALL_CATEGORIES
            ? faqs
            : faqs.filter((faq) => categoryOf(faq) === categoryFilter);

    return (
        <>
            <Head title="FAQs" />

            <div className="p-4 md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {faqs.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3">
                                <Label
                                    htmlFor="category-filter"
                                    className="text-muted-foreground"
                                >
                                    Filter by category
                                </Label>
                                <Select
                                    value={categoryFilter}
                                    onValueChange={setCategoryFilter}
                                >
                                    <SelectTrigger
                                        id="category-filter"
                                        className="w-56"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL_CATEGORIES}>
                                            All categories ({faqs.length})
                                        </SelectItem>
                                        {filterOptions.map((category) => (
                                            <SelectItem
                                                key={category}
                                                value={category}
                                            >
                                                {category} ({countIn(category)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {canManage &&
                                    categoryFilter !== ALL_CATEGORIES &&
                                    categoryFilter !== DEFAULT_CATEGORY && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() =>
                                                setDeletingCategory(
                                                    categoryFilter,
                                                )
                                            }
                                        >
                                            <Trash2 /> Delete category
                                        </Button>
                                    )}
                            </div>
                        )}
                    </div>
                    {canManage && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setAddingCategory(true)}
                            >
                                <FolderPlus /> Add category
                            </Button>
                            <Button onClick={() => setDialog(null)}>
                                <Plus /> Add question
                            </Button>
                        </div>
                    )}
                </div>

                {faqs.length === 0 ? (
                    <div className="flex flex-col items-center px-4 py-16 text-center">
                        <CircleHelp
                            className="text-muted-foreground/60 size-8"
                            aria-hidden="true"
                        />
                        <p className="mt-3 font-medium">No questions yet</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Add your first question and it will appear on the
                            FAQ page.
                        </p>
                    </div>
                ) : (
                    /* Open table: no outer box, just hairline dividers. The
                       negative margin lets row hover backgrounds bleed past the
                       text edge so content still lines up with the toolbar. */
                    <div className="-mx-3 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-muted-foreground border-b text-xs tracking-wider uppercase">
                                    <th
                                        scope="col"
                                        className="w-16 px-3 py-3 font-medium"
                                    >
                                        Order
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3 font-medium"
                                    >
                                        Question
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3 font-medium"
                                    >
                                        Category
                                    </th>
                                    <th scope="col" className="w-0 px-3 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleFaqs.map((faq) => (
                                    <tr
                                        key={faq.id}
                                        className="group hover:bg-muted/40 border-border/60 border-b transition-colors"
                                    >
                                        <td className="text-muted-foreground px-3 py-3.5 tabular-nums">
                                            {faq.sort_order}
                                        </td>
                                        <td className="max-w-xl px-3 py-3.5">
                                            <p className="font-medium">
                                                {faq.question}
                                                {!faq.is_active && (
                                                    <StatusDot
                                                        label="Hidden"
                                                        dotClassName="bg-slate-400"
                                                        muted
                                                        className="ml-2 align-middle text-xs font-normal"
                                                    />
                                                )}
                                            </p>
                                            <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                                                {faq.answer}
                                            </p>
                                        </td>
                                        <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap">
                                            {faq.category ?? "General"}
                                        </td>
                                        <td className="px-3 py-3.5">
                                            {/* Revealed on hover for pointer devices;
                                                always visible on touch and when a
                                                control inside has keyboard focus. */}
                                            <div className="flex items-center justify-end gap-0.5 transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setViewing(faq)
                                                    }
                                                    className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                    aria-label={`View ${faq.question}`}
                                                    title="View"
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                                {canManage && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDialog(faq)
                                                            }
                                                            className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                            aria-label={`Edit ${faq.question}`}
                                                            title="Edit"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleting(faq)
                                                            }
                                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                            aria-label={`Delete ${faq.question}`}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {visibleFaqs.length === 0 && (
                                    <TableEmptyRow
                                        colSpan={4}
                                        icon={CircleHelp}
                                        title="No questions in this category yet"
                                        description="Add a question or pick another category."
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Keyed so the form starts fresh for each question it opens. */}
            <FaqDialog
                key={`faq-${dialog === undefined ? "closed" : (dialog?.id ?? "new")}`}
                faq={dialog ?? null}
                open={dialog !== undefined}
                categories={categories}
                onClose={() => setDialog(undefined)}
            />

            <Dialog
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{viewing?.question}</DialogTitle>
                        <DialogDescription>
                            {viewing?.category ?? DEFAULT_CATEGORY} ·{" "}
                            {viewing?.is_active ? "Visible" : "Hidden"} on the
                            website
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-sm whitespace-pre-line">
                        {viewing?.answer}
                    </p>
                </DialogContent>
            </Dialog>

            <CategoryDialog
                key={`category-${addingCategory ? "open" : "closed"}`}
                open={addingCategory}
                onClose={() => setAddingCategory(false)}
            />

            <ConfirmDialog
                open={deletingCategory !== null}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                title={`Delete the "${deletingCategory}" category?`}
                description={`Its ${deletingCategory ? countIn(deletingCategory) : 0} question(s) will not be deleted; they move to General.`}
                confirmLabel="Delete category"
                onConfirm={() => {
                    if (deletingCategory) {
                        router.delete(destroyCategory().url, {
                            data: { name: deletingCategory },
                            preserveScroll: true,
                            onSuccess: () => setCategoryFilter(ALL_CATEGORIES),
                        });
                    }

                    setDeletingCategory(null);
                }}
            />

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete this question?"
                description={deleting?.question}
                confirmLabel="Delete"
                onConfirm={() => {
                    if (deleting) {
                        router.delete(destroy(deleting.id).url, {
                            preserveScroll: true,
                        });
                    }

                    setDeleting(null);
                }}
            />
        </>
    );
}

AdminFaqsIndex.layout = {
    breadcrumbs: [{ title: "FAQs", href: index() }],
};
