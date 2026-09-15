import { Head } from '@inertiajs/react';
import {
    Package,
    ReceiptText,
    Tag,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { dashboard } from '@/routes/admin';
import type { DashboardStats } from '@/types';

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    icon: typeof Users;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                    {label}
                </CardTitle>
                <Icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard({ stats }: { stats: DashboardStats }) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4">
                <h1 className="text-2xl font-semibold">Dashboard</h1>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <StatCard
                        label="Total Orders"
                        value={stats.total_orders}
                        icon={ReceiptText}
                    />
                    <StatCard
                        label="Total Revenue"
                        value={formatCurrency(stats.total_revenue)}
                        icon={Wallet}
                    />
                    <StatCard
                        label="Orders Today"
                        value={stats.orders_today}
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Revenue Today"
                        value={formatCurrency(stats.revenue_today)}
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Total Customers"
                        value={stats.total_customers}
                        icon={Users}
                    />
                    <StatCard
                        label="Total Products"
                        value={stats.total_products}
                        icon={Package}
                    />
                    <StatCard
                        label="Total Categories"
                        value={stats.total_categories}
                        icon={Tag}
                    />
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
