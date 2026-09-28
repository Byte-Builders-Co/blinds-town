import { Head } from "@inertiajs/react";
import { CategoryCard } from "@/components/shop/category-card";
import type { Category } from "@/types";

export default function Categories({ categories }: { categories: Category[] }) {
    return (
        <>
            <Head title="Shop by Category" />

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                    Shop by Category
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Browse all our blind categories.
                </p>

                {categories.length === 0 ? (
                    <p className="text-muted-foreground mt-12 text-center">
                        No categories found.
                    </p>
                ) : (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                showCount
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
