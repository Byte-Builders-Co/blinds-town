import { Head, Link, router, useForm } from "@inertiajs/react";
import { Pencil, Trash2, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import InputError from "@/components/input-error";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { destroy, edit, index, updateStatus } from "@/routes/admin/customers";
import { USER_STATUS_LABELS } from "@/types/auth";
import type { Address, Order, User, UserStatus } from "@/types";

const statusVariant: Record<
    UserStatus,
    "default" | "secondary" | "destructive"
> = {
    active: "default",
    inactive: "secondary",
    blocked: "destructive",
};

export default function AdminCustomerShow({
    customer,
    statuses,
}: {
    customer: User & { addresses: Address[]; orders: Order[] };
    statuses: UserStatus[];
}) {
    const form = useForm({ status: customer.status });
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const submit = () => {
        form.patch(updateStatus(customer).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title={customer.name} />

            <div className="p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                        {customer.profile_image_path ? (
                            <img
                                src={`/storage/${customer.profile_image_path}`}
                                alt={customer.name}
                                className="size-14 shrink-0 rounded-full border object-cover"
                            />
                        ) : (
                            <div className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-full border">
                                <UserIcon className="size-6" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {customer.name}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {customer.email}
                                {customer.mobile_number &&
                                    ` · ${customer.mobile_number}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={edit(customer)}>
                                <Pencil /> Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setConfirmingDelete(true)}
                        >
                            <Trash2 /> Delete
                        </Button>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Addresses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {customer.addresses.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        No addresses on file.
                                    </p>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {customer.addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className="rounded-lg border p-3 text-sm"
                                            >
                                                <p className="font-medium">
                                                    {address.full_name}{" "}
                                                    {address.is_default && (
                                                        <Badge className="ml-1">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {address.address_line1},{" "}
                                                    {address.city},{" "}
                                                    {address.state}{" "}
                                                    {address.pincode}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {customer.orders.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        No orders yet.
                                    </p>
                                ) : (
                                    <div className="divide-y">
                                        {customer.orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                                            >
                                                <span className="font-medium">
                                                    {order.order_number}
                                                </span>
                                                <OrderStatusBadge
                                                    status={order.status}
                                                />
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        order.total,
                                                        order.currency,
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <Badge
                                        variant={
                                            statusVariant[customer.status]
                                        }
                                    >
                                        {USER_STATUS_LABELS[customer.status]}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Last login
                                    </span>
                                    <span>
                                        {customer.last_login_at
                                            ? formatRelativeTime(
                                                  customer.last_login_at,
                                              )
                                            : "Never"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Customer since
                                    </span>
                                    <span>
                                        {formatRelativeTime(
                                            customer.created_at,
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Update Status</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">
                                        Status
                                    </label>
                                    <Select
                                        value={form.data.status}
                                        onValueChange={(value) =>
                                            form.setData(
                                                "status",
                                                value as UserStatus,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                >
                                                    {
                                                        USER_STATUS_LABELS[
                                                            status
                                                        ]
                                                    }
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.status} />
                                </div>
                                <Button
                                    onClick={submit}
                                    disabled={form.processing}
                                >
                                    Update Status
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmingDelete}
                onOpenChange={setConfirmingDelete}
                title={`Delete "${customer.name}"?`}
                description="This will remove the customer's access. Their order history is kept and this can be restored later if needed."
                confirmLabel="Delete"
                onConfirm={() => router.delete(destroy(customer).url)}
            />
        </>
    );
}

AdminCustomerShow.layout = {
    breadcrumbs: [{ title: "Customers", href: index() }],
};
