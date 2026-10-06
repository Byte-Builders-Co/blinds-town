import { Head } from "@inertiajs/react";
import { UserForm } from "@/components/admin/user-form";
import { index, update } from "@/routes/admin/users";
import type { EditableUser, PermissionGroups, RoleOption } from "@/types";
import type { UserStatus } from "@/types/auth";

export default function AdminUserEdit({
    user,
    isSelf,
    isLastSuperAdmin,
    roles,
    statuses,
    permissionGroups,
    permissionLabels,
    groupDescriptions,
}: {
    user: EditableUser;
    isSelf: boolean;
    isLastSuperAdmin: boolean;
    roles: RoleOption[];
    statuses: UserStatus[];
    permissionGroups: PermissionGroups;
    permissionLabels: Record<string, string>;
    groupDescriptions: Record<string, string>;
}) {
    const lockedReason = isSelf
        ? "You cannot change your own role or status."
        : isLastSuperAdmin
          ? "This is the last Super Admin, so their role and status are locked."
          : undefined;

    return (
        <>
            <Head title={`Edit ${user.first_name} ${user.last_name}`} />

            <UserForm
                isNew={false}
                roles={roles}
                statuses={statuses}
                permissionGroups={permissionGroups}
                permissionLabels={permissionLabels}
                groupDescriptions={groupDescriptions}
                roleLockedReason={lockedReason}
                submitLabel="Save changes"
                initial={{
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    mobile_number: user.mobile_number ?? "",
                    password: "",
                    password_confirmation: "",
                    role: user.role,
                    status: user.status,
                    permissions: user.permissions,
                }}
                onSubmit={(form) =>
                    form.put(update(user.id).url, { preserveScroll: true })
                }
            />
        </>
    );
}

AdminUserEdit.layout = {
    breadcrumbs: [
        { title: "Users", href: index() },
        { title: "Edit", href: "#" },
    ],
};
