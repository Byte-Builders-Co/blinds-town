import { Head, Link, router, usePage } from "@inertiajs/react";
import { Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { StatusDot } from "@/components/admin/status-dot";
import { TableEmptyRow } from "@/components/admin/table-empty-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { create, destroy, edit, index } from "@/routes/admin/cms-pages";

type PageRow = {
    id: number;
    slug: string;
    title: string;
    is_active: boolean;
    show_in_footer: boolean;
    updated_at: string;
    public_url: string;
};

export default function AdminCmsPagesIndex({ pages }: { pages: PageRow[] }) {
    const { auth } = usePage().props;
    const canManage = auth.permissions.includes("settings.manage");
    const [deleting, setDeleting] = useState<PageRow | null>(null);

    return (
        <>
            <Head title="Content Pages" />

            <div className="p-4 md:p-6">
                <div className="flex justify-end">
                    {canManage && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus /> Add page
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Open table: no outer box, just hairline dividers. The negative
                    margin lets row hover backgrounds bleed past the text edge so
                    content still lines up with the toolbar above. */}
                <div className="-mx-3 mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b text-xs tracking-wider uppercase">
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Page
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Last updated
                                </th>
                                <th scope="col" className="w-0 px-3 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page) => (
                                <tr
                                    key={page.id}
                                    className="group hover:bg-muted/40 border-border/60 border-b transition-colors"
                                >
                                    <td className="px-3 py-3.5">
                                        <Link
                                            href={edit(page.slug)}
                                            className="font-medium hover:underline"
                                        >
                                            {page.title}
                                        </Link>
                                        {page.show_in_footer && (
                                            <span className="text-muted-foreground">
                                                {" "}
                                                &middot; In footer
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3.5">
                                        <StatusDot
                                            label={
                                                page.is_active
                                                    ? "Published"
                                                    : "Hidden"
                                            }
                                            dotClassName={
                                                page.is_active
                                                    ? "bg-emerald-500"
                                                    : "bg-slate-400"
                                            }
                                            muted={!page.is_active}
                                        />
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap">
                                        {new Date(
                                            page.updated_at,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-3 py-3.5">
                                        {/* Revealed on hover for pointer devices;
                                            always visible on touch and when a
                                            control inside has keyboard focus. */}
                                        <div className="flex items-center justify-end gap-0.5 transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                            {page.is_active && (
                                                <a
                                                    href={page.public_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                    aria-label={`View ${page.title}`}
                                                    title="View"
                                                >
                                                    <Eye className="size-4" />
                                                </a>
                                            )}
                                            <Link
                                                href={edit(page.slug)}
                                                className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label={`Edit ${page.title}`}
                                                title="Edit"
                                            >
                                                <Pencil className="size-4" />
                                            </Link>
                                            {canManage && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleting(page)
                                                    }
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                    aria-label={`Delete ${page.title}`}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pages.length === 0 && (
                                <TableEmptyRow
                                    colSpan={4}
                                    icon={FileText}
                                    title="No pages yet"
                                    description="Pages you add will show up here."
                                />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Delete ${deleting?.title}?`}
                description="The page is removed from your website and its content is lost. This cannot be undone."
                confirmLabel="Delete page"
                onConfirm={() => {
                    if (deleting) {
                        router.delete(destroy(deleting.slug).url, {
                            preserveScroll: true,
                        });
                    }

                    setDeleting(null);
                }}
            />
        </>
    );
}

AdminCmsPagesIndex.layout = {
    breadcrumbs: [{ title: "Content Pages", href: index() }],
};
