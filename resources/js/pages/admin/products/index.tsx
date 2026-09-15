import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { create, destroy, edit, index } from '@/routes/admin/products';
import type { Paginated, Product } from '@/types';

export default function AdminProductsIndex({
    products,
}: {
    products: Paginated<Product>;
}) {
    return (
        <>
            <Head title="Products" />

            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Products</h1>
                    <Button asChild>
                        <Link href={create()}>
                            <Plus /> New Product
                        </Link>
                    </Button>
                </div>

                <div className="mt-6 divide-y rounded-lg border">
                    {products.data.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center justify-between px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-muted-foreground text-sm">
                                    {product.category?.name} &middot; From{' '}
                                    {formatCurrency(product.base_price)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={
                                        product.is_featured
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {product.is_featured
                                        ? 'Featured'
                                        : 'Not Featured'}
                                </Badge>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={edit(product)}>Edit</Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (
                                            confirm(`Delete "${product.name}"?`)
                                        ) {
                                            router.delete(destroy(product).url);
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <PaginationLinks paginated={products} />
                </div>
            </div>
        </>
    );
}

AdminProductsIndex.layout = {
    breadcrumbs: [{ title: 'Products', href: index() }],
};
