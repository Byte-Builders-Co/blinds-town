import { Head, router, usePage } from "@inertiajs/react";
import { Check, EyeOff, MessageSquareOff, Star, Trash2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { ReviewImageViewer } from "@/components/admin/review-image-viewer";
import { StatusDot } from "@/components/admin/status-dot";
import { TableEmptyRow } from "@/components/admin/table-empty-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationLinks } from "@/components/pagination-links";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { destroy, index, updateStatus } from "@/routes/admin/reviews";
import type { Paginated, ProductReview } from "@/types";

type Filters = { search?: string; status?: string; rating?: string };

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={`size-3.5 ${n <= rating ? "fill-current text-amber-500" : "text-muted-foreground/30"}`}
                />
            ))}
        </div>
    );
}

const STATUS_DOT: Record<string, string> = {
    pending: "bg-amber-500",
    approved: "bg-emerald-500",
    rejected: "bg-red-500",
    hidden: "bg-slate-400",
};

const moderationActions: {
    status: ProductReview["status"];
    label: string;
    icon: LucideIcon;
}[] = [
    { status: "approved", label: "Approve", icon: Check },
    { status: "rejected", label: "Reject", icon: X },
    { status: "hidden", label: "Hide", icon: EyeOff },
];

export default function AdminReviewsIndex({
    reviews,
    filters,
}: {
    reviews: Paginated<ProductReview>;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const { errors } = usePage().props;
    const [deleting, setDeleting] = useState<ProductReview | null>(null);

    const applyFilters = (patch: Partial<Filters>) => {
        router.get(
            index().url,
            { ...filters, search, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    const setStatus = (review: ProductReview, status: string) => {
        router.patch(updateStatus(review.id).url, { status });
    };

    return (
        <>
            <Head title="Reviews" />

            <div className="p-4">
                {errors.review && (
                    <p className="text-destructive mt-4 text-sm">
                        {errors.review}
                    </p>
                )}

                <div className="flex flex-wrap gap-3">
                    <Input
                        placeholder="Search customer, product, or title..."
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.rating ?? "all"}
                        onValueChange={(value) =>
                            applyFilters({
                                rating: value === "all" ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All ratings</SelectItem>
                            {[5, 4, 3, 2, 1].map((n) => (
                                <SelectItem key={n} value={n.toString()}>
                                    {n} star{n === 1 ? "" : "s"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                                    Review
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Status
                                </th>
                                <th scope="col" className="w-0 px-3 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.data.map((review) => (
                                <tr
                                    key={review.id}
                                    className="group hover:bg-muted/40 border-border/60 border-b transition-colors"
                                >
                                    <td className="px-3 py-4 align-top">
                                        <p className="font-medium">
                                            {review.user
                                                ? `${review.user.first_name} ${review.user.last_name}`
                                                : "Customer"}
                                            <span className="text-muted-foreground font-normal">
                                                {" "}
                                                &middot;{" "}
                                                {review.product?.name ??
                                                    "Product"}
                                            </span>
                                        </p>
                                        <div className="mt-1">
                                            <Stars rating={review.rating} />
                                        </div>
                                        <p className="mt-1 text-sm font-medium">
                                            {review.title}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {review.comment}
                                        </p>
                                        {review.images && (
                                            <ReviewImageViewer
                                                reviewId={review.id}
                                                images={review.images}
                                            />
                                        )}
                                        <p className="text-muted-foreground mt-2 text-xs">
                                            {new Date(
                                                review.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-3 py-4 align-top">
                                        <StatusDot
                                            label={review.status}
                                            dotClassName={
                                                STATUS_DOT[review.status] ??
                                                "bg-slate-400"
                                            }
                                            className="capitalize"
                                        />
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                        {/* Revealed on hover for pointer devices;
                                            always visible on touch and when a
                                            control inside has keyboard focus. */}
                                        <div className="flex items-center justify-end gap-0.5 transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                            {moderationActions.map((action) =>
                                                action.status ===
                                                review.status ? (
                                                    <span
                                                        key={action.status}
                                                        className="size-8"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <button
                                                        key={action.status}
                                                        type="button"
                                                        onClick={() =>
                                                            setStatus(
                                                                review,
                                                                action.status,
                                                            )
                                                        }
                                                        className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                        aria-label={`${action.label} review`}
                                                        title={action.label}
                                                    >
                                                        <action.icon className="size-4" />
                                                    </button>
                                                ),
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleting(review)
                                                }
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                aria-label="Delete review"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {reviews.data.length === 0 && (
                                <TableEmptyRow
                                    colSpan={3}
                                    icon={MessageSquareOff}
                                    title="No reviews found"
                                />
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <PaginationLinks paginated={reviews} label="reviews" />
                </div>
            </div>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete this review?"
                description="This cannot be undone."
                confirmLabel="Delete"
                onConfirm={() => {
                    if (deleting) {
                        router.delete(destroy(deleting.id).url);
                    }

                    setDeleting(null);
                }}
            />
        </>
    );
}

AdminReviewsIndex.layout = {
    breadcrumbs: [{ title: "Reviews", href: index() }],
};
