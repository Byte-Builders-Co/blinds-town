export type SalesSummary = {
    today: number;
    this_week: number;
    this_month: number;
    range: number;
};

export type OrderCounts = {
    total: number;
    by_status: Record<string, number>;
};

export type RevenueSummary = {
    gross: number;
    discounts: number;
    tax: number;
    shipping: number;
    installation: number;
    net: number;
};

export type ProductCounts = {
    total: number;
    active: number;
    out_of_stock: number;
};

export type CustomerCounts = {
    total: number;
    new: number;
    returning: number;
};

export type BestSeller = {
    product_id: number;
    name: string;
    units_sold: number;
    revenue: number;
};

export type ReportFilters = {
    from: string;
    to: string;
    sort: "units" | "revenue";
};
