import { Head } from '@inertiajs/react';
import { ProductFilterBar } from '@/components/shop/product-filter-bar';
import { ProductGrid } from '@/components/shop/product-grid';
import { index } from '@/routes/products';
import type {
    CategoryOption,
    ColorOption,
    Paginated,
    Product,
    ProductFilters,
} from '@/types';

export default function ProductsIndex({
    products,
    categories,
    colorOptions,
    filters,
}: {
    products: Paginated<Product>;
    categories: CategoryOption[];
    colorOptions: ColorOption[];
    filters: ProductFilters;
}) {
    return (
        <>
            <Head title="Shop All Products" />

            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">All Products</h1>
                <p className="text-muted-foreground mt-2">
                    Browse our full range of made-to-measure blinds.
                </p>

                <div className="mt-8">
                    <ProductFilterBar
                        baseUrl={index().url}
                        filters={filters}
                        categories={categories}
                        colorOptions={colorOptions}
                    >
                        <ProductGrid
                            products={products}
                            emptyMessage="No products match your filters."
                        />
                    </ProductFilterBar>
                </div>
            </div>
        </>
    );
}
