import { Head } from "@inertiajs/react";
import { ProductFilterBar } from "@/components/shop/product-filter-bar";
import { ProductGrid } from "@/components/shop/product-grid";
import { show } from "@/routes/categories";
import type {
    Category,
    ColorOption,
    Paginated,
    Product,
    ProductFilters,
} from "@/types";

export default function ShopCategory({
    category,
    products,
    colorOptions,
    filters,
}: {
    category: Category;
    products: Paginated<Product>;
    colorOptions: ColorOption[];
    filters: ProductFilters;
}) {
    return (
        <>
            <Head title={category.name} />

            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">{category.name}</h1>
                {category.description && (
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        {category.description}
                    </p>
                )}

                <div className="mt-8">
                    <ProductFilterBar
                        baseUrl={show(category.slug).url}
                        filters={filters}
                        colorOptions={colorOptions}
                    >
                        <ProductGrid
                            products={products}
                            emptyMessage="No products in this category yet."
                        />
                    </ProductFilterBar>
                </div>
            </div>
        </>
    );
}
