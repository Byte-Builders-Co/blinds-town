import { Head, Link, router, useForm } from "@inertiajs/react";
import {
    Calendar,
    Clock,
    Mail,
    MapPin,
    Pencil,
    Phone,
    ShieldCheck,
    Trash2,
    User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import InputError from "@/components/input-error";
import { PaginationLinks } from "@/components/pagination-links";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { destroy, edit, index, updateStatus } from "@/routes/admin/customers";
import { show as showOrder } from "@/routes/admin/orders";
import { USER_STATUS_LABELS } from "@/types/auth";
import type { Address, Order, Paginated, User, UserStatus } from "@/types";

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
    orders,
    statuses,
}: {
    customer: User & { addresses: Address[] };
    orders: Paginated<Order>;
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
                                className="size-12 shrink-0 rounded-full border object-cover"
                            />
                        ) : (
                            <div className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full border">
                                <UserIcon className="size-6" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl font-semibold">
                                {customer.name}
                            </h1>
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

                <div className="mt-4 grid gap-6 lg:grid-cols-3">
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
                                                {address.is_default && (
                                                    <Badge className="mb-1">
                                                        Default
                                                    </Badge>
                                                )}
                                                <p className="text-muted-foreground flex items-start gap-2">
                                                    <MapPin className="mt-0.5 size-4 shrink-0" />
                                                    <span>
                                                        {address.address_line1},{" "}
                                                        {address.city},{" "}
                                                        {address.state}{" "}
                                                        {address.pincode}
                                                    </span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {orders.data.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        No orders yet.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-muted/40 text-muted-foreground border-b text-left">
                                                    <th className="px-4 py-2 font-medium">
                                                        Order ID
                                                    </th>
                                                    <th className="px-4 py-2 font-medium">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-2 text-right font-medium">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {orders.data.map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        onClick={() =>
                                                            router.visit(
                                                                showOrder(order)
                                                                    .url,
                                                            )
                                                        }
                                                        className="hover:bg-accent/50 cursor-pointer"
                                                    >
                                                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                                                            {order.order_number}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <OrderStatusBadge
                                                                status={
                                                                    order.status
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                                                            {formatCurrency(
                                                                order.total,
                                                                order.currency,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                            {orders.data.length > 0 && (
                                <div className="px-6">
                                    <PaginationLinks
                                        paginated={orders}
                                        label="orders"
                                    />
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="border-b pb-4">
                                <CardTitle>Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Mail className="size-4 shrink-0" />
                                        Email
                                    </span>
                                    <span className="truncate text-right">
                                        {customer.email}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Phone className="size-4 shrink-0" />
                                        Mobile
                                    </span>
                                    <span>{customer.mobile_number ?? "—"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <ShieldCheck className="size-4 shrink-0" />
                                        Status
                                    </span>
                                    <Badge
                                        variant={statusVariant[customer.status]}
                                    >
                                        {USER_STATUS_LABELS[customer.status]}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Clock className="size-4 shrink-0" />
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
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Calendar className="size-4 shrink-0" />
                                        Member since
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
                            <CardContent className="grid gap-2">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <div className="grid flex-1 gap-2">
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
                                    </div>
                                    <Button
                                        onClick={submit}
                                        disabled={form.processing}
                                        className="w-full sm:w-auto"
                                    >
                                        Update Status
                                    </Button>
                                </div>
                                <InputError message={form.errors.status} />
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
