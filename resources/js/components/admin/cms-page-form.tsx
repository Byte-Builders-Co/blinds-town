import { Link, useForm } from "@inertiajs/react";
import { ExternalLink } from "lucide-react";
import type { FormEvent } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { index } from "@/routes/admin/cms-pages";

export type CmsPageFormData = {
    title: string;
    slug: string;
    content: string;
    is_active: boolean;
    show_in_footer: boolean;
    footer_order: string;
};

type Props = {
    heading: string;
    description: string;
    /** Public address of an existing page; omitted while creating. */
    viewUrl?: string;
    initial: CmsPageFormData;
    /** Creating a page lets you choose its URL; afterwards it stays fixed. */
    isNew: boolean;
    submitLabel: string;
    onSubmit: (form: ReturnType<typeof useForm<CmsPageFormData>>) => void;
};

/**
 * The form shared by "Add page" and "Edit page": title, rich-text content,
 * and visibility (published and footer link).
 */
export function CmsPageForm({
    heading,
    description,
    viewUrl,
    initial,
    isNew,
    submitLabel,
    onSubmit,
}: Props) {
    const form = useForm<CmsPageFormData>(initial);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={submit} className="flex min-h-full flex-1 flex-col">
            <div className="w-full flex-1 space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold">{heading}</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {description}
                        </p>
                    </div>
                    {viewUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={viewUrl} target="_blank" rel="noreferrer">
                                <ExternalLink /> View page
                            </a>
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
                    <div className="min-w-0 space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Page title</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData("title", e.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.title} />
                        </div>

                        {isNew && (
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Page address</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">
                                        /pages/
                                    </span>
                                    <Input
                                        id="slug"
                                        value={form.data.slug}
                                        placeholder="Leave empty to use the title"
                                        onChange={(e) =>
                                            form.setData("slug", e.target.value)
                                        }
                                    />
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Letters, numbers and dashes. It cannot be
                                    changed after the page is created.
                                </p>
                                <InputError message={form.errors.slug} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Content</Label>
                            <RichTextEditor
                                value={form.data.content}
                                onChange={(html) =>
                                    form.setData("content", html)
                                }
                                invalid={!!form.errors.content}
                            />
                            <InputError message={form.errors.content} />
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <section className="space-y-4 rounded-lg border p-4">
                            <h2 className="font-semibold">Visibility</h2>

                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="is_active"
                                    className="mt-0.5"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            "is_active",
                                            checked === true,
                                        )
                                    }
                                />
                                <div className="grid gap-1">
                                    <Label htmlFor="is_active">Published</Label>
                                    <p className="text-muted-foreground text-xs">
                                        When off, visitors get a &ldquo;page not
                                        found&rdquo; and the footer link is
                                        hidden.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="show_in_footer"
                                    className="mt-0.5"
                                    checked={form.data.show_in_footer}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            "show_in_footer",
                                            checked === true,
                                        )
                                    }
                                />
                                <div className="grid gap-1">
                                    <Label htmlFor="show_in_footer">
                                        Show in website footer
                                    </Label>
                                    <p className="text-muted-foreground text-xs">
                                        Adds a link under
                                        &ldquo;Information&rdquo; in the footer.
                                        Deleting or unpublishing the page
                                        removes it.
                                    </p>
                                </div>
                            </div>

                            {form.data.show_in_footer && (
                                <div className="grid gap-2">
                                    <Label htmlFor="footer_order">
                                        Footer order
                                    </Label>
                                    <Input
                                        id="footer_order"
                                        type="number"
                                        min={0}
                                        value={form.data.footer_order}
                                        placeholder="Adds to the end"
                                        onChange={(e) =>
                                            form.setData(
                                                "footer_order",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Lower numbers appear first.
                                    </p>
                                    <InputError
                                        message={form.errors.footer_order}
                                    />
                                </div>
                            )}
                        </section>
                    </aside>
                </div>
            </div>

            <div className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t px-4 py-3 backdrop-blur md:px-6">
                <p className="text-muted-foreground text-sm" aria-live="polite">
                    {form.isDirty ? "You have unsaved changes." : " "}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href={index()}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing && <Spinner />}
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
