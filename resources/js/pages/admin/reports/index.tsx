import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { index } from "@/routes/admin/reports";
import type {
    BestSeller,
    CustomerCounts,
    OrderCounts,
    ProductCounts,
    ReportFilters,
    RevenueSummary,
    SalesSummary,
} from "@/types";

function formatCurrency(value: number): string {
    return `$${value.toFixed(2)}`;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mt-8">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="mt-3">{children}</div>
        </section>
    );
}

const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    measurement_pending: "Measurement Pending",
    manufacturing: "Manufacturing",
    ready_to_ship: "Ready to Ship",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export default function AdminReportsIndex({
    filters,
    sales,
    orders,
    revenue,
    products,
    customers,
    bestSellers,
}: {
    filters: ReportFilters;
    sales: SalesSummary;
    orders: OrderCounts;
    revenue: RevenueSummary;
    products: ProductCounts;
    customers: CustomerCounts;
    bestSellers: BestSeller[];
}) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const apply = (patch: Partial<ReportFilters> = {}) => {
        router.get(
            index().url,
            { from, to, sort: filters.sort, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Reports" />

            <div className="p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <h1 className="text-2xl font-semibold">
                        Reports & Analytics
                    </h1>
                    <div className="flex items-end gap-2">
                        <div className="grid gap-1">
                            <label className="text-muted-foreground text-xs">
                                From
                            </label>
                            <Input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="w-40"
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="text-muted-foreground text-xs">
                                To
                            </label>
                            <Input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="w-40"
                            />
                        </div>
                        <Button onClick={() => apply()}>Apply</Button>
                    </div>
                </div>

                <Section title="Sales">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard
                            label="Today"
                            value={formatCurrency(sales.today)}
                        />
                        <StatCard
                            label="This Week"
                            value={formatCurrency(sales.this_week)}
                        />
                        <StatCard
                            label="This Month"
                            value={formatCurrency(sales.this_month)}
                        />
                        <StatCard
                            label={`${from} to ${to}`}
                            value={formatCurrency(sales.range)}
                        />
                    </div>
                </Section>

                <Section title="Orders">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard label="Total Orders" value={orders.total} />
                        {Object.entries(orders.by_status).map(
                            ([status, count]) => (
                                <StatCard
                                    key={status}
                                    label={statusLabels[status] ?? status}
                                    value={count}
                                />
                            ),
                        )}
                    </div>
                </Section>

                <Section title="Revenue">
                    <p className="text-muted-foreground -mt-1 mb-3 text-sm">
                        For the selected date range.
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Gross Revenue"
                            value={formatCurrency(revenue.gross)}
                        />
                        <StatCard
                            label="Discounts"
                            value={formatCurrency(revenue.discounts)}
                        />
                        <StatCard
                            label="Tax / GST"
                            value={formatCurrency(revenue.tax)}
                        />
                        <StatCard
                            label="Shipping"
                            value={formatCurrency(revenue.shipping)}
                        />
                        <StatCard
                            label="Installation"
                            value={formatCurrency(revenue.installation)}
                        />
                        <StatCard
                            label="Net Revenue"
                            value={formatCurrency(revenue.net)}
                        />
                    </div>
                </Section>

                <Section title="Products">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Total Products"
                            value={products.total}
                        />
                        <StatCard
                            label="Active Products"
                            value={products.active}
                        />
                        <StatCard
                            label="Out of Stock"
                            value={products.out_of_stock}
                        />
                    </div>
                </Section>

                <Section title="Customers">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Total Customers"
                            value={customers.total}
                        />
                        <StatCard
                            label="New (in range)"
                            value={customers.new}
                        />
                        <StatCard
                            label="Returning"
                            value={customers.returning}
                        />
                    </div>
                </Section>

                <Section title="Best-Selling Blinds">
                    <div className="mb-3 flex gap-2">
                        <Button
                            variant={
                                filters.sort === "units" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => apply({ sort: "units" })}
                        >
                            Sort by Units Sold
                        </Button>
                        <Button
                            variant={
                                filters.sort === "revenue"
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => apply({ sort: "revenue" })}
                        >
                            Sort by Revenue
                        </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="text-muted-foreground border-b text-left">
                                <tr>
                                    <th className="px-4 py-2 font-medium">
                                        Product
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Units Sold
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {bestSellers.map((row) => (
                                    <tr key={row.product_id}>
                                        <td className="px-4 py-2">
                                            {row.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {row.units_sold}
                                        </td>
                                        <td className="px-4 py-2">
                                            {formatCurrency(row.revenue)}
                                        </td>
                                    </tr>
                                ))}
                                {bestSellers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="text-muted-foreground px-4 py-8 text-center"
                                        >
                                            No sales in this date range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Section>

                <Section title="Profit & Margin">
                    <p className="text-muted-foreground text-sm">
                        Product cost data is not tracked yet, so profit and
                        margin cannot be calculated. This section will appear
                        once cost-per-product data is available.
                    </p>
                </Section>
            </div>
        </>
    );
}

AdminReportsIndex.layout = {
    breadcrumbs: [{ title: "Reports", href: index() }],
};
