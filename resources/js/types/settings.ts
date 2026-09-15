export type StoreSettings = {
    store_name: string;
    store_email: string | null;
    store_phone: string | null;
    store_address: string | null;
    currency: string;
    timezone: string;
    logo_path: string | null;
    favicon_path: string | null;
};

export type BusinessSettings = {
    legal_business_name: string | null;
    business_address: string | null;
    business_phone: string | null;
    business_email: string | null;
    gstin: string | null;
    registration_details: string | null;
};

export type TaxSettings = {
    gst_enabled: boolean;
    gst_rate: number;
    tax_inclusive: boolean;
};

export type ShippingSettings = {
    shipping_enabled: boolean;
    free_shipping_threshold: number | null;
    default_shipping_charge: number;
    installation_charge: number;
};

export type PaymentSettings = {
    payment_gateway: string;
    test_mode: boolean;
};

export type NotificationSettings = {
    channel_email: boolean;
    channel_sms: boolean;
    channel_whatsapp: boolean;
    event_order_created: boolean;
    event_payment_success: boolean;
    event_payment_failed: boolean;
    event_order_shipped: boolean;
    event_order_delivered: boolean;
    event_low_stock: boolean;
};

export type SettingsGroup =
    | 'store'
    | 'business'
    | 'tax'
    | 'shipping'
    | 'payment'
    | 'notifications';
