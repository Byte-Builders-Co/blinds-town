import { Link } from "@inertiajs/react";
import { ImageOff, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { index, show } from "@/routes/admin/products";
import type { DashboardRange, DashboardTopProduct } from "@/types";
import { useDashboardFormat } from "./dashboard-format";
import { DeltaBadge } from "./delta-badge";
import { EmptyState, Panel } from "./panel";

export function TopProducts({
    products,
    range,
}: {
    products: DashboardTopProduct[];
    range: DashboardRange;
}) {
    const { money, number } = useDashboardFormat();
    const leader = Math.max(1, ...products.map((product) => product.revenue));

    return (
        <Panel
            title="Top Selling Products"
            description={`Ranked by revenue · ${range.label}`}
            flush
            action={
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mr-5 -mb-1"
                >
                    <Link href={index()} prefetch>
                        View All Products
                    </Link>
                </Button>
            }
        >
            {products.length === 0 ? (
                <EmptyState
                    icon={PackageSearch}
                    title="No product sales yet"
                    description="Products appear here once orders come in for the selected period."
                />
            ) : (
                <div>
                    <div className="text-muted-foreground hidden grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_8.5rem_5.5rem] items-center gap-4 border-y px-5 py-2 text-xs font-medium md:grid">
                        <span>Product</span>
                        <span className="text-right">Orders</span>
                        <span className="text-right">Units sold</span>
                        <span className="text-right">Revenue</span>
                        <span className="text-right">Trend</span>
                    </div>
                    <ul className="divide-y border-t md:border-t-0">
                        {products.map((product) => (
                            <li
                                key={product.product_id}
                                className="hover:bg-muted/40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-5 py-3 transition-colors md:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_8.5rem_5.5rem]"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="bg-muted text-muted-foreground grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border">
                                        {product.image_path ? (
                                            <img
                                                src={`/storage/${product.image_path}`}
                                                alt=""
                                                loading="lazy"
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <ImageOff
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <Link
                                            href={show(product.product_id)}
                                            className="hover:text-primary block truncate text-sm font-medium transition-colors"
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {product.category ??
                                                "Uncategorised"}
                                        </p>
                                        <p className="text-muted-foreground mt-0.5 text-xs md:hidden">
                                            {number(product.orders)} orders ·{" "}
                                            {number(product.units)} units
                                        </p>
                                    </div>
                                </div>

                                <span className="text-right text-sm tabular-nums max-md:hidden">
                                    {number(product.orders)}
                                </span>
                                <span className="text-right text-sm tabular-nums max-md:hidden">
                                    {number(product.units)}
                                </span>

                                <div className="flex flex-col items-end gap-1.5">
                                    <span className="text-sm font-semibold tabular-nums">
                                        {money(product.revenue)}
                                    </span>
                                    <span
                                        className="bg-chart-1/15 h-1 w-20 overflow-hidden rounded-full"
                                        role="img"
                                        aria-label={`${Math.round((product.revenue / leader) * 100)}% of the top product's revenue`}
                                    >
                                        <span
                                            className="bg-chart-1 block h-full rounded-full"
                                            style={{
                                                width: `${(product.revenue / leader) * 100}%`,
                                            }}
                                        />
                                    </span>
                                </div>

                                <div className="flex justify-end max-md:hidden">
                                    <DeltaBadge change={product.change} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Panel>
    );
}
