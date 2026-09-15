import { Star } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import type { Paginated, ProductReview } from '@/types';

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={`size-4 ${n <= rating ? 'fill-current text-amber-500' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

export function ReviewList({
    reviews,
    avgRating,
    ratingBreakdown,
}: {
    reviews: Paginated<ProductReview>;
    avgRating: number | null;
    ratingBreakdown: Record<number, number>;
}) {
    const getInitials = useInitials();
    const total = reviews.total;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start gap-8">
                <div>
                    <p className="text-3xl font-semibold">
                        {avgRating ? avgRating.toFixed(1) : '—'}
                    </p>
                    <Stars rating={Math.round(avgRating ?? 0)} />
                    <p className="text-muted-foreground mt-1 text-sm">
                        {total} review{total === 1 ? '' : 's'}
                    </p>
                </div>

                <div className="min-w-48 flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingBreakdown[star] ?? 0;
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        return (
                            <div
                                key={star}
                                className="flex items-center gap-2 text-xs"
                            >
                                <span className="w-3">{star}</span>
                                <div className="bg-muted h-2 flex-1 rounded-full">
                                    <div
                                        className="h-2 rounded-full bg-amber-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-muted-foreground w-6 text-right">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {reviews.data.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    No reviews yet. Be the first to review this product.
                </p>
            ) : (
                <div className="divide-y">
                    {reviews.data.map((review) => (
                        <div key={review.id} className="py-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-medium">
                                    {review.user
                                        ? getInitials(
                                              `${review.user.first_name} ${review.user.last_name}`,
                                          )
                                        : '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {review.user
                                            ? `${review.user.first_name} ${review.user.last_name}`
                                            : 'Customer'}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {new Date(
                                            review.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2">
                                <Stars rating={review.rating} />
                            </div>
                            <p className="mt-1 font-medium">{review.title}</p>
                            <p className="text-muted-foreground text-sm">
                                {review.comment}
                            </p>
                            {review.images && review.images.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {review.images.map((image) => (
                                        <img
                                            key={image}
                                            src={`/storage/${image}`}
                                            alt=""
                                            className="size-16 rounded-md object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
