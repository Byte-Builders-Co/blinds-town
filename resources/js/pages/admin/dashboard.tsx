import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { CategorySales } from "@/components/admin/dashboard/category-sales";
import { DashboardFormatProvider } from "@/components/admin/dashboard/dashboard-format";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { PeriodFilter } from "@/components/admin/dashboard/period-filter";
import type { PeriodChange } from "@/components/admin/dashboard/period-filter";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { RecentOrders } from "@/components/admin/dashboard/recent-orders";
import { SalesOverview } from "@/components/admin/dashboard/sales-overview";
import { TopProducts } from "@/components/admin/dashboard/top-products";
import { cn } from "@/lib/utils";
import { dashboard } from "@/routes/admin";
import type {
    DashboardActivity,
    DashboardCategorySale,
    DashboardKpis,
    DashboardOrder,
    DashboardRange,
    DashboardRangeKey,
    DashboardSales,
    DashboardTopProduct,
} from "@/types";

type Props = {
    range: DashboardRange;
    currency: string;
    kpis: DashboardKpis;
    sales: DashboardSales;
    topProducts: DashboardTopProduct[];
    categories: DashboardCategorySale[];
    recentOrders: DashboardOrder[];
    activity: DashboardActivity[];
};

/** The props that depend on the selected period; the rest never change with it. */
const RANGE_PROPS = ["range", "kpis", "sales", "topProducts", "categories"];

export default function AdminDashboard({
    range,
    currency,
    kpis,
    sales,
    topProducts,
    categories,
    recentOrders,
    activity,
}: Props) {
    const { auth } = usePage().props;
    const [pendingKey, setPendingKey] = useState<DashboardRangeKey | null>(
        null,
    );
    const [loading, setLoading] = useState(false);

    const changePeriod = (change: PeriodChange) => {
        setPendingKey(change.key);

        router.get(
            dashboard().url,
            change.key === "custom"
                ? { range: "custom", from: change.from, to: change.to }
                : { range: change.key },
            {
                only: RANGE_PROPS,
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onStart: () => setLoading(true),
                onFinish: () => {
                    setLoading(false);
                    setPendingKey(null);
                },
            },
        );
    };

    return (
        <DashboardFormatProvider currency={currency}>
            <Head title={`${auth.role?.label ?? "Admin"} Dashboard`} />

            <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
                <header className="flex justify-end">
                    <PeriodFilter
                        range={range}
                        pendingKey={pendingKey}
                        onChange={changePeriod}
                    />
                </header>

                {/* Everything the period filter scopes holds its previous render, dimmed, while it reloads. */}
                <div
                    className={cn(
                        "space-y-6 transition-opacity duration-200",
                        loading && "pointer-events-none opacity-60",
                    )}
                    aria-busy={loading}
                >
                    <KpiCards kpis={kpis} range={range} />

                    <SalesOverview sales={sales} range={range} />

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="min-w-0 *:h-full xl:col-span-2">
                            <TopProducts products={topProducts} range={range} />
                        </div>
                        <div className="min-w-0 *:h-full">
                            <CategorySales
                                categories={categories}
                                range={range}
                            />
                        </div>
                    </div>
                </div>

                <RecentOrders orders={recentOrders} />

                <RecentActivity activity={activity} />
            </div>
        </DashboardFormatProvider>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
    ],
};
