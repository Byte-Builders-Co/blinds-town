import { Head, router, usePage } from "@inertiajs/react";
import { Star } from "lucide-react";
import { useState } from "react";
import { ReviewImageViewer } from "@/components/admin/review-image-viewer";
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

const statusVariant: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    pending: "outline",
    approved: "default",
    rejected: "destructive",
    hidden: "secondary",
};

export default function AdminReviewsIndex({
    reviews,
    filters,
}: {
    reviews: Paginated<ProductReview>;
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

    const setStatus = (review: ProductReview, status: string) => {
        router.patch(updateStatus(review.id).url, { status });
    };

    return (
        <>
            <Head title="Reviews" />

            <div className="p-4">
                <h1 className="text-2xl font-semibold">Reviews</h1>

                {errors.review && (
                    <p className="text-destructive mt-4 text-sm">
                        {errors.review}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
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

                <div className="mt-6 divide-y rounded-lg border">
                    {reviews.data.map((review) => (
                        <div key={review.id} className="px-4 py-3">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium">
                                        {review.user
                                            ? `${review.user.first_name} ${review.user.last_name}`
                                            : "Customer"}
                                        <span className="text-muted-foreground font-normal">
                                            {" "}
                                            &middot;{" "}
                                            {review.product?.name ?? "Product"}
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
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-2">
                                    <Badge
                                        variant={statusVariant[review.status]}
                                        className="capitalize"
                                    >
                                        {review.status}
                                    </Badge>
                                    <div className="flex gap-2">
                                        {review.status !== "approved" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setStatus(
                                                        review,
                                                        "approved",
                                                    )
                                                }
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {review.status !== "rejected" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setStatus(
                                                        review,
                                                        "rejected",
                                                    )
                                                }
                                            >
                                                Reject
                                            </Button>
                                        )}
                                        {review.status !== "hidden" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setStatus(review, "hidden")
                                                }
                                            >
                                                Hide
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        "Delete this review?",
                                                    )
                                                ) {
                                                    router.delete(
                                                        destroy(review.id).url,
                                                    );
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {reviews.data.length === 0 && (
                        <p className="text-muted-foreground px-4 py-8 text-center text-sm">
                            No reviews found.
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <PaginationLinks paginated={reviews} label="reviews" />
                </div>
            </div>
        </>
    );
}

AdminReviewsIndex.layout = {
    breadcrumbs: [{ title: "Reviews", href: index() }],
};
