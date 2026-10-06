import { Head, Link, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, Trash2, UserSearch } from "lucide-react";
import { useState } from "react";
import { StatusDot, USER_STATUS_DOT } from "@/components/admin/status-dot";
import { TableEmptyRow } from "@/components/admin/table-empty-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationLinks } from "@/components/pagination-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/utils";
import { create, destroy, edit, index } from "@/routes/admin/users";
import type { ManagedUser, Paginated, RoleOption } from "@/types";
import { USER_STATUS_LABELS } from "@/types/auth";

type Filters = { search?: string; role?: string };

const ROLE_DOT: Record<string, string> = {
    "super-admin": "bg-primary",
    admin: "bg-chart-1",
    staff: "bg-chart-3",
    customer: "bg-muted-foreground/50",
};

export default function AdminUsersIndex({
    users,
    filters,
    roles,
}: {
    users: Paginated<ManagedUser>;
    filters: Filters;
    roles: RoleOption[];
}) {
    const { auth, errors } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? "");
    const [deleting, setDeleting] = useState<ManagedUser | null>(null);

    const canCreate = auth.permissions.includes("users.create");
    const canEdit = auth.permissions.includes("users.edit");

    const applyFilters = (patch: Partial<Filters>) => {
        router.get(
            index().url,
            { ...filters, search, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Users" />

            <div className="p-4">
                {Object.values(errors).length > 0 && (
                    <p className="text-destructive mb-4 text-sm">
                        {Object.values(errors)[0]}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") applyFilters({});
                        }}
                        onBlur={() => applyFilters({})}
                        className="max-w-xs"
                    />
                    <Select
                        value={filters.role ?? "all"}
                        onValueChange={(value) =>
                            applyFilters({
                                role: value === "all" ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {canCreate && (
                        <Button asChild className="ml-auto">
                            <Link href={create()}>
                                <Plus /> New User
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Open table: no outer box, just hairline dividers. The negative
                    margin lets row hover backgrounds bleed past the text edge so
                    content still lines up with the toolbar above. */}
                <div className="-mx-3 mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b text-xs tracking-wider uppercase">
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    User
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Role
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Last login
                                </th>
                                <th scope="col" className="w-0 px-3 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="group hover:bg-muted/40 border-border/60 border-b transition-colors"
                                >
                                    <td className="px-3 py-3.5">
                                        <p className="font-medium">
                                            {user.name}
                                            {user.is_self && (
                                                <span className="text-muted-foreground font-normal">
                                                    {" "}
                                                    (you)
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {user.email}
                                        </p>
                                    </td>
                                    <td className="px-3 py-3.5">
                                        <StatusDot
                                            label={user.role.label}
                                            dotClassName={
                                                ROLE_DOT[user.role.value] ??
                                                "bg-muted-foreground/50"
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-3.5">
                                        <StatusDot
                                            label={
                                                USER_STATUS_LABELS[user.status]
                                            }
                                            dotClassName={
                                                USER_STATUS_DOT[user.status]
                                            }
                                            muted={user.status !== "active"}
                                        />
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap">
                                        {user.last_login_at
                                            ? formatRelativeTime(
                                                  user.last_login_at,
                                              )
                                            : "Never"}
                                    </td>
                                    <td className="px-3 py-3.5">
                                        {/* Revealed on hover for pointer devices;
                                            always visible on touch and when a
                                            control inside has keyboard focus. */}
                                        <div className="flex items-center justify-end gap-0.5 transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                                            {canEdit && (
                                                <Link
                                                    href={edit(user.id)}
                                                    className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                    aria-label={`Edit ${user.name}`}
                                                    title="Edit"
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            )}
                                            {user.can_delete && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleting(user)
                                                    }
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex size-8 items-center justify-center rounded-md transition-colors"
                                                    aria-label={`Delete ${user.name}`}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <TableEmptyRow
                                    colSpan={5}
                                    icon={UserSearch}
                                    title="No users found"
                                />
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <PaginationLinks paginated={users} label="users" />
                </div>
            </div>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Delete ${deleting?.name}?`}
                description={`Their ${deleting?.role.label} account is removed and they can no longer sign in.`}
                confirmLabel="Delete"
                onConfirm={() => {
                    if (deleting) {
                        router.delete(destroy(deleting.id).url, {
                            preserveScroll: true,
                        });
                    }

                    setDeleting(null);
                }}
            />
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [{ title: "Users", href: index() }],
};
