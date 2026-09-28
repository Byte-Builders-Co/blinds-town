import { Link } from "@inertiajs/react";
import { show } from "@/routes/categories";
import type { Category } from "@/types";

export function CategoryCard({
    category,
    showCount = false,
}: {
    category: Category;
    showCount?: boolean;
}) {
    return (
        <Link
            href={show(category.slug)}
            className="group flex flex-col items-center text-center"
        >
            <div className="bg-muted aspect-square w-full overflow-hidden rounded-lg">
                {category.image_path ? (
                    <img
                        src={`/storage/${category.image_path}`}
                        alt={category.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                ) : (
                    <div className="text-muted-foreground flex h-full w-full items-center justify-center text-2xl font-semibold">
                        {category.name.charAt(0)}
                    </div>
                )}
            </div>
            <p className="mt-3 text-sm font-medium">{category.name}</p>
            {showCount && category.products_count !== undefined && (
                <p className="text-muted-foreground text-xs">
                    {category.products_count} product
                    {category.products_count === 1 ? "" : "s"}
                </p>
            )}
        </Link>
    );
}
