import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/types";

export function RelatedProducts({ products }: { products: Product[] }) {
    if (products.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold">You may also like</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
