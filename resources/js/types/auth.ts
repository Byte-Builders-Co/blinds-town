export type UserStatus = "active" | "inactive" | "blocked";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    blocked: "Blocked",
};

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    mobile_number: string | null;
    profile_image_path: string | null;
    date_of_birth: string | null;
    status: UserStatus;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    roles: string[];
    permissions: string[];
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
