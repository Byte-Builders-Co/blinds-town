import type { User } from "@/types/auth";
import type { OrderStatus, PaymentStatus } from "@/types/shop";

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

export type DashboardRangeKey =
    "today" | "7d" | "30d" | "3m" | "12m" | "custom";

export type DashboardRange = {
    key: DashboardRangeKey;
    from: string;
    to: string;
    label: string;
    comparison_label: string;
    granularity: "day" | "week" | "month";
};

/** Percentage change against the previous period; null when it had no data. */
export type DashboardChange = number | null;

export type DashboardSalesPoint = {
    label: string;
    title: string;
    revenue: number;
    orders: number;
    previous_title: string | null;
    previous_revenue: number | null;
    previous_orders: number | null;
};

export type DashboardSales = {
    granularity: DashboardRange["granularity"];
    points: DashboardSalesPoint[];
    summary: {
        revenue: number;
        orders: number;
        average_order_value: number;
        previous_revenue: number;
        previous_orders: number;
        previous_average_order_value: number;
        revenue_change: DashboardChange;
        orders_change: DashboardChange;
        average_order_value_change: DashboardChange;
    };
};

export type DashboardKpis = {
    revenue: {
        value: number;
        previous: number;
        change: DashboardChange;
        lifetime: number;
        trend: (number | null)[];
    };
    orders: {
        value: number;
        previous: number;
        change: DashboardChange;
        lifetime: number;
        pending: number;
        cancelled: number;
        trend: (number | null)[];
    };
    customers: {
        total: number;
        new: number;
        previous_new: number;
        change: DashboardChange;
        trend: number[];
    };
    products: {
        total: number;
        active: number;
        out_of_stock: number;
    };
};

export type DashboardTopProduct = {
    product_id: number;
    name: string;
    category: string | null;
    image_path: string | null;
    orders: number;
    units: number;
    revenue: number;
    change: DashboardChange;
};

export type DashboardCategorySale = {
    category_id: number;
    name: string;
    orders: number;
    units: number;
    revenue: number;
};

export type DashboardOrder = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string | null;
    product: string | null;
    extra_items: number;
    total: number;
    status: OrderStatus;
    payment_status: PaymentStatus | null;
    created_at: string;
};

export type DashboardActivityType =
    | "order_received"
    | "order_shipped"
    | "payment_received"
    | "refund_processed"
    | "customer_registered"
    | "product_added"
    | "product_updated";

export type DashboardActivity = {
    type: DashboardActivityType;
    title: string;
    description: string;
    at: string;
    subject: { type: "order" | "customer" | "product"; id: number } | null;
};


export type TopProduct = {
    product_id: number;
    name: string;
    units_sold: number;
    revenue: number;
};
