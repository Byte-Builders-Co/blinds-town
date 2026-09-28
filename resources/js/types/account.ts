export type AddressType = "home" | "office" | "other";

export type Address = {
    id: number;
    user_id: number;
    full_name: string;
    mobile_number: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    country: string;
    pincode: string;
    landmark: string | null;
    type: AddressType;
    is_default: boolean;
};
