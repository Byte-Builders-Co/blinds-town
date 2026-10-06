import { Package, ReceiptText, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type { DashboardKpis, DashboardRange } from "@/types";
import { useDashboardFormat } from "./dashboard-format";
import { DeltaBadge } from "./delta-badge";

type KpiCardProps = {
    label: string;
    icon: LucideIcon;
    value: string;
    /** The period the number covers, e.g. "Last 30 days". */
    caption: string;
    change?: number | null;
    hasValue?: boolean;
    comparison?: string;
    children?: ReactNode;
};

function KpiCard({
    label,
    icon: Icon,
    value,
    caption,
    change,
    hasValue,
    comparison,
    children,
}: KpiCardProps) {
    return (
        <Card className="gap-0 rounded-md py-5 shadow-xs">
            <div className="px-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-muted-foreground truncate text-sm font-medium">
                            {label}
                        </p>
                        <p className="text-muted-foreground/80 mt-0.5 truncate text-xs">
                            {caption}
                        </p>
                    </div>
                    <span className="bg-chart-1/10 text-chart-1 grid size-9 shrink-0 place-items-center rounded-md">
                        <Icon className="size-[18px]" aria-hidden="true" />
                    </span>
                </div>

                <div className="mt-4">
                    <p className="text-foreground text-[1.75rem] leading-none font-semibold tracking-tight">
                        {value}
                    </p>
                </div>

                {change !== undefined && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <DeltaBadge change={change} hasValue={hasValue} />
                        <span className="text-muted-foreground text-xs">
                            {comparison}
                        </span>
                    </div>
                )}

                <div className="text-muted-foreground mt-2 text-xs">
                    {children}
                </div>
            </div>
        </Card>
    );
}

export function KpiCards({
    kpis,
    range,
}: {
    kpis: DashboardKpis;
    range: DashboardRange;
}) {
    const { money, number } = useDashboardFormat();
    const { revenue, orders, customers, products } = kpis;

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
                label="Total Revenue"
                icon={Wallet}
                value={money(revenue.value)}
                caption={range.label}
                change={revenue.change}
                hasValue={revenue.value > 0}
                comparison={range.comparison_label}
            >
                {money(revenue.lifetime)} lifetime
            </KpiCard>

            <KpiCard
                label="Total Orders"
                icon={ReceiptText}
                value={number(orders.value)}
                caption={range.label}
                change={orders.change}
                hasValue={orders.value > 0}
                comparison={range.comparison_label}
            >
                {number(orders.pending)} pending · {number(orders.cancelled)}{" "}
                cancelled
            </KpiCard>

            <KpiCard
                label="Total Customers"
                icon={Users}
                value={number(customers.total)}
                caption="Registered customers"
                change={customers.change}
                hasValue={customers.new > 0}
                comparison={`${number(customers.new)} new · ${range.comparison_label}`}
            >
                {number(customers.new)} joined {range.label.toLowerCase()}
            </KpiCard>

            <KpiCard
                label="Total Products"
                icon={Package}
                value={number(products.total)}
                caption="In the catalogue"
            >
                <span className="flex flex-wrap gap-x-3 gap-y-1">
                    <span>{number(products.active)} active</span>
                    <span>{number(products.out_of_stock)} out of stock</span>
                </span>
            </KpiCard>
        </div>
    );
}
