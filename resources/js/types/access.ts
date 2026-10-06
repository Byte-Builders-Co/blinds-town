import type { UserRoleName } from "@/types/auth";
import type { UserStatus } from "@/types/auth";

export type RoleOption = {
    value: UserRoleName;
    label: string;
};

/** Permissions grouped by the module they unlock, e.g. "Orders" → ["orders.view", …]. */
export type PermissionGroups = Record<string, string[]>;

export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    mobile_number: string | null;
    status: UserStatus;
    role: RoleOption;
    last_login_at: string | null;
    is_self: boolean;
    can_delete: boolean;
};

export type EditableUser = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string | null;
    status: UserStatus;
    role: UserRoleName;
    /** Permissions given to this person individually (staff). */
    permissions: string[];
};

export type ActivityLogRow = {
    id: number;
    action: string;
    description: string;
    causer: string | null;
    created_at: string;
};

/** "orders.update_status" → "Update status" */
export function permissionLabel(permission: string): string {
    const action = permission.split(".").slice(1).join(" ").replace(/_/g, " ");

    return action.charAt(0).toUpperCase() + action.slice(1);
}
