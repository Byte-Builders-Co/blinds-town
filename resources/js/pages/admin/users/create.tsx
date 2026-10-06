import { Head } from "@inertiajs/react";
import { UserForm } from "@/components/admin/user-form";
import { index, store } from "@/routes/admin/users";
import type { PermissionGroups, RoleOption } from "@/types";
import type { UserStatus } from "@/types/auth";

export default function AdminUserCreate({
    roles,
    statuses,
    permissionGroups,
    permissionLabels,
    groupDescriptions,
}: {
    roles: RoleOption[];
    statuses: UserStatus[];
    permissionGroups: PermissionGroups;
    permissionLabels: Record<string, string>;
    groupDescriptions: Record<string, string>;
}) {
    return (
        <>
            <Head title="New User" />

            <UserForm
                isNew
                roles={roles}
                statuses={statuses}
                permissionGroups={permissionGroups}
                permissionLabels={permissionLabels}
                groupDescriptions={groupDescriptions}
                submitLabel="Create user"
                initial={{
                    first_name: "",
                    last_name: "",
                    email: "",
                    mobile_number: "",
                    password: "",
                    password_confirmation: "",
                    role: roles[roles.length - 1]?.value ?? "customer",
                    status: "active",
                    permissions: [],
                }}
                onSubmit={(form) => form.post(store().url)}
            />
        </>
    );
}

AdminUserCreate.layout = {
    breadcrumbs: [
        { title: "Users", href: index() },
        { title: "New User", href: "#" },
    ],
};
