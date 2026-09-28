import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
    images,
    alt,
}: {
    images: string[];
    alt: string;
}) {
    const [active, setActive] = useState(0);

    if (images.length === 0) {
        return (
            <div className="bg-muted flex aspect-square w-full items-center justify-center rounded-xl">
                <span className="text-muted-foreground text-sm">
                    No image available
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="bg-muted aspect-square w-full overflow-hidden rounded-xl">
                <img
                    src={`/storage/${images[active]}`}
                    alt={alt}
                    className="size-full object-cover"
                />
            </div>

            {images.length > 1 && (
                <div className="flex gap-2">
                    {images.map((image, index) => (
                        <button
                            key={image}
                            type="button"
                            onClick={() => setActive(index)}
                            className={cn(
                                "size-16 overflow-hidden rounded-md border-2",
                                index === active
                                    ? "border-primary"
                                    : "border-transparent",
                            )}
                        >
                            <img
                                src={`/storage/${image}`}
                                alt={`${alt} thumbnail ${index + 1}`}
                                className="size-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
