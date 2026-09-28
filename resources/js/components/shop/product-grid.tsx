import { PaginationLinks } from "@/components/pagination-links";
import { ProductCard } from "@/components/shop/product-card";
import type { Paginated, Product } from "@/types";

export function ProductGrid({
    products,
    emptyMessage = "No products found.",
}: {
    products: Paginated<Product>;
    emptyMessage?: string;
}) {
    if (products.data.length === 0) {
        return (
            <p className="text-muted-foreground mt-12 text-center">
                {emptyMessage}
            </p>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <div className="mt-8">
                <PaginationLinks paginated={products} />
            </div>
        </div>
    );
}
