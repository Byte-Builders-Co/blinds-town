import { Link, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { index } from "@/routes/admin/users";
import { permissionLabel } from "@/types";
import type { PermissionGroups, RoleOption } from "@/types";
import { USER_STATUS_LABELS } from "@/types/auth";
import type { UserRoleName, UserStatus } from "@/types/auth";

/** Roles whose access is chosen person by person. */
const ACCESS_ROLES: UserRoleName[] = ["admin", "staff"];

export type UserFormData = {
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
    password: string;
    password_confirmation: string;
    role: UserRoleName;
    status: UserStatus;
    permissions: string[];
};

type Props = {
    initial: UserFormData;
    roles: RoleOption[];
    statuses: UserStatus[];
    permissionGroups: PermissionGroups;
    permissionLabels: Record<string, string>;
    groupDescriptions: Record<string, string>;
    isNew: boolean;
    submitLabel: string;
    /** Why the role cannot be changed (own account, or the last Super Admin). */
    roleLockedReason?: string;
    onSubmit: (form: ReturnType<typeof useForm<UserFormData>>) => void;
};

/**
 * The form shared by "New user" and "Edit user". The role list only holds
 * roles the signed-in person may hand out, and staff permissions only the ones
 * they may grant; the server checks both again on save.
 */
export function UserForm({
    initial,
    roles,
    statuses,
    permissionGroups,
    permissionLabels,
    groupDescriptions,
    isNew,
    submitLabel,
    roleLockedReason,
    onSubmit,
}: Props) {
    const form = useForm<UserFormData>(initial);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit(form);
    };

    const togglePermission = (permission: string, on: boolean) => {
        form.setData(
            "permissions",
            on
                ? [...form.data.permissions, permission]
                : form.data.permissions.filter((item) => item !== permission),
        );
    };

    const groups = Object.entries(permissionGroups);
    const allPermissions = Object.values(permissionGroups).flat();

    // A new Admin starts with everything ticked (untick what they should not
    // have); a Staff member starts with nothing ticked. Anything already
    // chosen is kept when the role does not change between the two.
    const changeRole = (value: string) => {
        const role = value as UserRoleName;

        let permissions = form.data.permissions;

        if (role === "admin" && form.data.role !== "admin") {
            permissions = allPermissions;
        } else if (role === "staff" && form.data.role !== "staff") {
            permissions = [];
        }

        form.setData({ ...form.data, role, permissions });
    };

    return (
        <form onSubmit={submit} className="p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Account details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="first_name">First name</Label>
                        <Input
                            id="first_name"
                            value={form.data.first_name}
                            onChange={(e) =>
                                form.setData("first_name", e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.first_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="last_name">Last name</Label>
                        <Input
                            id="last_name"
                            value={form.data.last_name}
                            onChange={(e) =>
                                form.setData("last_name", e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.last_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData("email", e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mobile_number">Phone (optional)</Label>
                        <Input
                            id="mobile_number"
                            value={form.data.mobile_number}
                            onChange={(e) =>
                                form.setData("mobile_number", e.target.value)
                            }
                        />
                        <InputError message={form.errors.mobile_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {isNew ? "Password" : "New password (optional)"}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData("password", e.target.value)
                            }
                            required={isNew}
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password_confirmation}
                            onChange={(e) =>
                                form.setData(
                                    "password_confirmation",
                                    e.target.value,
                                )
                            }
                            required={isNew}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={form.data.role}
                            onValueChange={changeRole}
                            disabled={!!roleLockedReason}
                        >
                            <SelectTrigger id="role" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.value}
                                        value={role.value}
                                    >
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.data.role === "super-admin" && (
                            <p className="text-muted-foreground text-xs">
                                Super Admins always have full access, so there
                                is nothing to choose.
                            </p>
                        )}
                        {roleLockedReason && (
                            <p className="text-muted-foreground text-xs">
                                {roleLockedReason}
                            </p>
                        )}
                        <InputError message={form.errors.role} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData("status", value as UserStatus)
                            }
                            disabled={!!roleLockedReason}
                        >
                            <SelectTrigger id="status" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {USER_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                </CardContent>
            </Card>

            {ACCESS_ROLES.includes(form.data.role) && groups.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <CardTitle>
                                    {form.data.role === "admin"
                                        ? "Admin access"
                                        : "Staff access"}
                                </CardTitle>
                                <p className="text-muted-foreground mt-1.5 text-sm">
                                    {form.data.role === "admin"
                                        ? "Tick what this Admin can open and do. Everything is ticked to start with, so untick anything they should not have."
                                        : "Tick the modules this staff member can open and use."}{" "}
                                    Everyone can open the dashboard.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        form.setData(
                                            "permissions",
                                            allPermissions,
                                        )
                                    }
                                >
                                    Select all
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        form.setData("permissions", [])
                                    }
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {groups.map(([group, permissions]) => (
                            <fieldset key={group} className="space-y-2">
                                <legend className="text-sm font-medium">
                                    {group}
                                </legend>
                                <p className="text-muted-foreground mb-2 text-xs">
                                    {groupDescriptions[group]}
                                </p>
                                {permissions.map((permission) => (
                                    <div
                                        key={permission}
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            id={`perm-${permission}`}
                                            checked={form.data.permissions.includes(
                                                permission,
                                            )}
                                            onCheckedChange={(checked) =>
                                                togglePermission(
                                                    permission,
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`perm-${permission}`}
                                            className="font-normal"
                                        >
                                            {permissionLabels[permission] ??
                                                permissionLabel(permission)}
                                        </Label>
                                    </div>
                                ))}
                            </fieldset>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div className="bg-background sticky bottom-0 -mx-4 mt-6 flex justify-end gap-2 border-t px-4 py-4 md:-mx-6 md:px-6">
                <Button type="button" variant="outline" asChild>
                    <Link href={index()}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing && <Spinner />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
