import type { User } from '@/types/auth';

export type ActivityLog = {
    id: number;
    causer_id: number | null;
    causer: User | null;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    description: string;
    created_at: string;
};

export type DashboardStats = {
    total_orders: number;
    total_revenue: number;
    orders_today: number;
    revenue_today: number;
    total_customers: number;
    total_products: number;
    total_categories: number;
};

export type TopProduct = {
    product_id: number;
    name: string;
    units_sold: number;
    revenue: number;
};
