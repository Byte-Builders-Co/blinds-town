export type CouponRestrictionOption = {
    id: number;
    name: string;
};

export type Coupon = {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: string;
    min_order_amount: string | null;
    max_discount: string | null;
    starts_at: string | null;
    ends_at: string | null;
    usage_limit: number | null;
    per_user_limit: number | null;
    is_active: boolean;
    usages_count?: number;
    products?: CouponRestrictionOption[];
    categories?: CouponRestrictionOption[];
    created_at: string;
};
