import { LineChart, Table2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardRange, DashboardSales } from "@/types";
import { SalesChart } from "./charts/sales-chart";
import { useDashboardFormat } from "./dashboard-format";
import { DeltaBadge } from "./delta-badge";
import { Panel } from "./panel";

function Stat({
    label,
    value,
    change,
    hasValue,
}: {
    label: string;
    value: string;
    change: number | null;
    hasValue: boolean;
}) {
    return (
        <div className="min-w-0 px-4 first:pl-0 last:pr-0 sm:px-6 sm:first:pl-0">
            <p className="text-muted-foreground truncate text-xs font-medium">
                {label}
            </p>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-xl">
                {value}
            </p>
            <DeltaBadge
                change={change}
                hasValue={hasValue}
                className="mt-1.5"
            />
        </div>
    );
}

export function SalesOverview({
    sales,
    range,
}: {
    sales: DashboardSales;
    range: DashboardRange;
}) {
    const { money, compactMoney, number } = useDashboardFormat();
    const [showTable, setShowTable] = useState(false);

    const { summary, points } = sales;

    return (
        <Panel
            title="Sales Overview"
            description={`Revenue vs orders (running total) · ${range.label} · ${range.comparison_label}`}
            action={
                <Button
                    variant="outline"
                    size="icon"
                    className="size-9"
                    onClick={() => setShowTable((current) => !current)}
                    aria-pressed={showTable}
                    aria-label={showTable ? "Show chart" : "Show data table"}
                    title={showTable ? "Show chart" : "Show data table"}
                >
                    {showTable ? <LineChart /> : <Table2 />}
                </Button>
            }
        >
            <div className="mb-5 grid grid-cols-3 divide-x border-b pb-5">
                <Stat
                    label="Total revenue"
                    value={money(summary.revenue)}
                    change={summary.revenue_change}
                    hasValue={summary.revenue > 0}
                />
                <Stat
                    label="Total orders"
                    value={number(summary.orders)}
                    change={summary.orders_change}
                    hasValue={summary.orders > 0}
                />
                <Stat
                    label="Avg. order value"
                    value={money(summary.average_order_value)}
                    change={summary.average_order_value_change}
                    hasValue={summary.average_order_value > 0}
                />
            </div>

            <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5">
                    <span className="bg-chart-1 size-2.5 rounded-full" />
                    Days with orders
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="bg-chart-1 h-0.5 w-3.5 rounded-full" />
                    Running total (revenue so far)
                </span>
            </div>

            {showTable ? (
                <div className="max-h-72 overflow-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/60 text-muted-foreground sticky top-0 text-left text-xs">
                            <tr>
                                <th className="px-3 py-2 font-medium">
                                    Period
                                </th>
                                <th className="px-3 py-2 text-right font-medium">
                                    Revenue
                                </th>
                                <th className="px-3 py-2 text-right font-medium">
                                    Orders
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {points.map((point) => (
                                <tr key={point.title}>
                                    <td className="px-3 py-2">{point.title}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {money(point.revenue)}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {number(point.orders)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <SalesChart
                    points={points}
                    formatRevenue={money}
                    formatRevenueTick={compactMoney}
                    formatOrders={number}
                />
            )}
        </Panel>
    );
}
