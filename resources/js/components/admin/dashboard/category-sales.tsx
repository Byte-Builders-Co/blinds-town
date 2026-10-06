import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DashboardCategorySale, DashboardRange } from "@/types";
import { useDashboardFormat } from "./dashboard-format";
import { EmptyState, Panel } from "./panel";

type Metric = "revenue" | "orders" | "units";

const METRICS: { key: Metric; label: string }[] = [
    { key: "revenue", label: "Revenue" },
    { key: "orders", label: "Orders" },
    { key: "units", label: "Units" },
];

/**
 * One bar per top-level category, all in a single series colour (the bar
 * length already carries the value), sorted by the metric on show. The value
 * sits at the bar tip; the tooltip adds the other two metrics.
 */
export function CategorySales({
    categories,
    range,
}: {
    categories: DashboardCategorySale[];
    range: DashboardRange;
}) {
    const { money, number } = useDashboardFormat();
    const [metric, setMetric] = useState<Metric>("revenue");

    const format = (category: DashboardCategorySale, key: Metric) =>
        key === "revenue" ? money(category.revenue) : number(category[key]);

    const sorted = [...categories].sort((a, b) => b[metric] - a[metric]);
    const peak = Math.max(1, ...sorted.map((category) => category[metric]));

    return (
        <Panel
            title="Sales by Category"
            description={range.label}
            action={
                <ToggleGroup
                    type="single"
                    value={metric}
                    onValueChange={(value) =>
                        value && setMetric(value as Metric)
                    }
                    aria-label="Category metric"
                    className="bg-muted/60 h-9 gap-0.5 rounded-lg border p-0.5"
                >
                    {METRICS.map((item) => (
                        <ToggleGroupItem
                            key={item.key}
                            value={item.key}
                            className="text-muted-foreground hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground h-8 rounded-md px-2.5 text-xs font-medium hover:bg-transparent data-[state=on]:shadow-xs"
                        >
                            {item.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            }
        >
            {sorted.length === 0 ? (
                <EmptyState
                    icon={BarChart3}
                    title="No category sales yet"
                    description="Sales by blind category appear once orders come in."
                />
            ) : (
                <ul className="space-y-1">
                    {sorted.map((category) => (
                        <li key={category.category_id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="hover:bg-muted/60 focus-visible:ring-ring/50 group grid w-full grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors outline-none focus-visible:ring-2 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]"
                                    >
                                        <span className="text-muted-foreground group-hover:text-foreground truncate text-[13px] transition-colors">
                                            {category.name}
                                        </span>
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span
                                                className="bg-chart-1 group-hover:bg-chart-1/85 h-5 min-w-1 rounded-r-[4px] transition-[width,background-color] duration-300"
                                                style={{
                                                    width: `${(category[metric] / peak) * 78}%`,
                                                }}
                                            />
                                            <span className="text-foreground text-xs font-semibold whitespace-nowrap tabular-nums">
                                                {format(category, metric)}
                                            </span>
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    className="px-3 py-2"
                                >
                                    <p className="font-semibold">
                                        {category.name}
                                    </p>
                                    <dl className="mt-1.5 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 text-xs">
                                        {METRICS.map((item) => (
                                            <div
                                                key={item.key}
                                                className="contents"
                                            >
                                                <dt className="opacity-75">
                                                    {item.label}
                                                </dt>
                                                <dd className="text-right font-medium tabular-nums">
                                                    {format(category, item.key)}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </TooltipContent>
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}
