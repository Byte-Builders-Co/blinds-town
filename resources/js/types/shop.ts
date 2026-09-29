import type { User } from "./auth";

export type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    image_path: string | null;
    banner_image_path: string | null;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    sort_order: number;
    is_featured: boolean;
    is_active: boolean;
    products_count?: number;
    children_count?: number;
    parent?: Category | null;
    children?: Category[];
};

export type CategoryOption = {
    id: number;
    name: string;
    slug?: string;
};

export type MeasurementUnit = "cm" | "inch";

export type OptionGroupKind =
    | "fabric"
    | "color"
    | "material"
    | "pattern"
    | "opacity"
    | "mount_type"
    | "control_type"
    | "chain_cord"
    | "operation_type"
    | "motor"
    | "mechanism"
    | "accessory"
    | "custom";

export type OptionSelectionType = "single" | "multiple";

export const OPTION_GROUP_KIND_LABELS: Record<OptionGroupKind, string> = {
    fabric: "Fabric",
    color: "Color",
    material: "Material",
    pattern: "Pattern",
    opacity: "Opacity",
    mount_type: "Mount Type",
    control_type: "Control Type",
    chain_cord: "Chain/Cord",
    operation_type: "Operation Type",
    motor: "Motor",
    mechanism: "Mechanism",
    accessory: "Accessory",
    custom: "Custom",
};

/** Kinds rendered as visual selectors (swatches/image cards) before the size step. */
export const VISUAL_OPTION_KINDS: OptionGroupKind[] = [
    "color",
    "pattern",
    "material",
    "fabric",
    "opacity",
];

/** Kinds rendered after the size step (operation/motor/mechanism/accessories/etc). */
export const FUNCTIONAL_OPTION_KINDS: OptionGroupKind[] = [
    "operation_type",
    "mount_type",
    "control_type",
    "motor",
    "mechanism",
    "chain_cord",
    "accessory",
    "custom",
];

export type ProductOptionValue = {
    id: number;
    product_option_group_id: number;
    label: string;
    image_path: string | null;
    hex_color: string | null;
    price_modifier: string;
    price_per_sqm: string | null;
    instructions: string | null;
    is_default: boolean;
    is_active: boolean;
    requires_option_value_id: number | null;
    sort_order: number;
};

export type ProductOptionGroup = {
    id: number;
    product_id: number;
    name: string;
    kind: OptionGroupKind;
    selection_type: OptionSelectionType;
    is_required: boolean;
    is_active: boolean;
    requires_option_value_id: number | null;
    sort_order: number;
    values: ProductOptionValue[];
};

export type PricingTierType = "flat" | "per_sqm";

export const PRICING_TIER_TYPE_LABELS: Record<PricingTierType, string> = {
    flat: "Flat price for range",
    per_sqm: "Rate per m²",
};

export type ProductPricingTier = {
    id: number;
    product_id: number;
    min_area_sqm: string;
    max_area_sqm: string | null;
    pricing_type: PricingTierType;
    price: string;
    sort_order: number;
    is_active: boolean;
};

export type StockStatus = "in_stock" | "out_of_stock" | "made_to_order";

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
    in_stock: "In Stock",
    out_of_stock: "Out of Stock",
    made_to_order: "Available for Customization",
};

export type Product = {
    id: number;
    sku: string | null;
    category_id: number;
    category?: Category;
    name: string;
    slug: string;
    description: string | null;
    price_per_sqm: string;
    min_area_sqm: string | null;
    base_price: string;
    sale_price: number | null;
    tax_rate_percent: string | null;
    discount_percent: string | null;
    min_width_cm: number;
    max_width_cm: number;
    min_height_cm: number;
    max_height_cm: number;
    measurement_unit_default: MeasurementUnit;
    image_path: string | null;
    gallery: string[] | null;
    is_active: boolean;
    is_featured: boolean;
    stock_status: StockStatus;
    reviews_count?: number;
    reviews_avg_rating?: number | null;
    option_groups?: ProductOptionGroup[];
    pricing_tiers?: ProductPricingTier[];
    created_at?: string;
    updated_at?: string;
};

export type PriceBreakdownLine = {
    key: string;
    group: string | null;
    kind: OptionGroupKind | null;
    label: string;
    amount: number;
};

export type PriceBreakdown = {
    width_cm: number;
    height_cm: number;
    unit: MeasurementUnit;
    area_sqm: number;
    billable_area_sqm: number;
    base_price: number;
    fabric_cost: number;
    option_adjustments: number;
    mount_charge: number;
    control_charge: number;
    subtotal: number;
    product_discount: number;
    taxable_amount: number;
    tax_rate_percent: number;
    tax_amount: number;
    final_price: number;
    customization_total: number;
    discount: number;
    gst: number;
    breakdown: PriceBreakdownLine[];
};

export type ProductReview = {
    id: number;
    user_id: number;
    product_id: number;
    rating: number;
    title: string;
    comment: string;
    images: string[] | null;
    status: "pending" | "approved" | "rejected" | "hidden";
    created_at: string;
    user?: { id: number; first_name: string; last_name: string };
    product?: { id: number; name: string };
};

export type WishlistItem = {
    id: number;
    user_id: number;
    product_id: number;
    product: Product;
    created_at: string;
};

export type ColorOption = {
    label: string;
    hex_color: string | null;
};

export type ProductFilters = {
    search?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    color?: string[];
    availability?: StockStatus;
    sort?: string;
};

export type CartItem = {
    id: number;
    cart_id: number;
    product_id: number;
    product?: Product;
    width_cm: number;
    height_cm: number;
    measurement_unit: MeasurementUnit;
    quantity: number;
    selected_options: number[] | null;
    measurement_photo_path: string | null;
    price_breakdown: PriceBreakdown | null;
    unit_price: string;
    line_total: string;
};

export type Cart = {
    id: number;
    items: CartItem[];
};

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "measurement_pending"
    | "manufacturing"
    | "ready_to_ship"
    | "shipped"
    | "delivered"
    | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    measurement_pending: "Measurement Pending",
    manufacturing: "Manufacturing",
    ready_to_ship: "Ready to Ship",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
    "pending",
    "confirmed",
    "measurement_pending",
    "manufacturing",
    "ready_to_ship",
    "shipped",
    "delivered",
];

export type PaymentMethod = "online" | "cod";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    online: "Online Payment",
    cod: "Cash on Delivery",
};

export type PaymentStatus =
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    paid: "Paid",
    failed: "Failed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    partially_refunded: "Partially Refunded",
};

export type RefundStatus = "requested" | "processing" | "refunded" | "failed";

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
    requested: "Refund Requested",
    processing: "Refund Processing",
    refunded: "Refunded",
    failed: "Refund Failed",
};

export type Refund = {
    id: number;
    payment_id: number;
    amount: string;
    reason: string | null;
    status: RefundStatus;
    gateway_reference: string | null;
    created_at: string;
};

export type Payment = {
    id: number;
    order_id: number;
    method: PaymentMethod;
    gateway: string | null;
    amount: string;
    currency: string;
    status: PaymentStatus;
    gateway_session_id: string | null;
    gateway_transaction_id: string | null;
    paid_at: string | null;
    failure_reason: string | null;
    refunds?: Refund[];
};

export type OrderStatusHistory = {
    id: number;
    order_id: number;
    status: OrderStatus;
    note: string | null;
    created_at: string;
};

export type OrderItem = {
    id: number;
    order_id: number;
    product_id: number | null;
    product?: Product | null;
    product_name: string;
    width_cm: number;
    height_cm: number;
    measurement_unit: MeasurementUnit;
    quantity: number;
    selected_options: { group: string; label: string }[] | null;
    measurement_photo_path: string | null;
    price_breakdown: PriceBreakdown | null;
    unit_price: string;
    line_total: string;
};

export type Order = {
    id: number;
    user_id: number;
    order_number: string;
    status: OrderStatus;
    subtotal: string;
    discount_amount: string;
    coupon_code: string | null;
    tax_amount: string;
    shipping_charge: string;
    installation_requested: boolean;
    installation_charge: string;
    total: string;
    currency: string;
    shipping_name: string;
    shipping_line1: string;
    shipping_line2: string | null;
    shipping_city: string;
    shipping_postal_code: string;
    shipping_country: string;
    shipping_phone: string;
    carrier: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string;
    user?: User;
    items?: OrderItem[];
    items_count?: number;
    payment?: Payment | null;
    statusHistories?: OrderStatusHistory[];
};

export type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};
