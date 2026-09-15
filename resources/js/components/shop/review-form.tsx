import { useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/products/reviews';
import type { Product } from '@/types';

export function ReviewForm({ product }: { product: Product }) {
    const [rating, setRating] = useState(5);
    const form = useForm({
        rating: 5,
        title: '',
        comment: '',
        images: [] as File[],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({ ...data, rating }));
        form.post(store(product).url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">Write a review</h3>

            <div className="grid gap-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setRating(n)}
                            aria-label={`${n} star${n === 1 ? '' : 's'}`}
                        >
                            <Star
                                className={`size-6 ${n <= rating ? 'fill-current text-amber-500' : 'text-muted-foreground/30'}`}
                            />
                        </button>
                    ))}
                </div>
                <InputError message={form.errors.rating} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="review-title">Title</Label>
                <Input
                    id="review-title"
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                    required
                />
                <InputError message={form.errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="review-comment">Review</Label>
                <textarea
                    id="review-comment"
                    value={form.data.comment}
                    onChange={(e) => form.setData('comment', e.target.value)}
                    className="border-input dark:bg-input/30 min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
                    required
                />
                <InputError message={form.errors.comment} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="review-images">Photos (optional)</Label>
                <input
                    id="review-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                        form.setData('images', Array.from(e.target.files ?? []))
                    }
                    className="text-sm"
                />
                <InputError message={form.errors.images} />
            </div>

            <Button type="submit" disabled={form.processing}>
                Submit Review
            </Button>
        </form>
    );
}
