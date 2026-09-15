import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { removeImage } from '@/routes/admin/reviews';

export function ReviewImageViewer({
    reviewId,
    images,
}: {
    reviewId: number;
    images: string[];
}) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (images.length === 0) {
        return null;
    }

    return (
        <>
            <div className="mt-2 flex flex-wrap gap-2">
                {images.map((image, index) => (
                    <button
                        key={image}
                        type="button"
                        onClick={() => setOpenIndex(index)}
                    >
                        <img
                            src={`/storage/${image}`}
                            alt=""
                            className="size-14 rounded-md object-cover"
                        />
                    </button>
                ))}
            </div>

            <Dialog
                open={openIndex !== null}
                onOpenChange={(open) => !open && setOpenIndex(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Image</DialogTitle>
                    </DialogHeader>
                    {openIndex !== null && (
                        <>
                            <img
                                src={`/storage/${images[openIndex]}`}
                                alt=""
                                className="max-h-96 w-full rounded-md object-contain"
                            />
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    router.delete(
                                        removeImage({
                                            review: reviewId,
                                            index: openIndex,
                                        }).url,
                                        { onSuccess: () => setOpenIndex(null) },
                                    );
                                }}
                            >
                                Remove Image
                            </Button>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
