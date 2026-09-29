import { Head, useForm } from "@inertiajs/react";
import InputError from "@/components/input-error";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { index, updateStatus } from "@/routes/admin/customers";
import { USER_STATUS_LABELS } from "@/types/auth";
import type { Address, Order, User, UserStatus } from "@/types";

export default function AdminCustomerShow({
    customer,
    statuses,
}: {
    customer: User & { addresses: Address[]; orders: Order[] };
    statuses: UserStatus[];
}) {
    const form = useForm({ status: customer.status });

    const submit = () => {
        form.patch(updateStatus(customer).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title={customer.name} />

            <div className="max-w-3xl space-y-8 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">{customer.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        {customer.email}
                        {customer.mobile_number &&
                            ` · ${customer.mobile_number}`}
                    </p>
                </div>

                <div className="flex items-end gap-3">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData("status", value as UserStatus)
                            }
                        >
                            <SelectTrigger className="w-48">
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
                    <Button onClick={submit} disabled={form.processing}>
                        Update Status
                    </Button>
                </div>

                <div>
                    <h2 className="font-semibold">Addresses</h2>
                    {customer.addresses.length === 0 ? (
                        <p className="text-muted-foreground mt-2 text-sm">
                            No addresses on file.
                        </p>
                    ) : (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                                        {address.address_line1}, {address.city},{" "}
                                        {address.state} {address.pincode}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="font-semibold">Orders</h2>
                    {customer.orders.length === 0 ? (
                        <p className="text-muted-foreground mt-2 text-sm">
                            No orders yet.
                        </p>
                    ) : (
                        <div className="mt-3 divide-y rounded-lg border">
                            {customer.orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between px-4 py-3 text-sm"
                                >
                                    <span>{order.order_number}</span>
                                    <OrderStatusBadge status={order.status} />
                                    <span>
                                        {formatCurrency(
                                            order.total,
                                            order.currency,
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AdminCustomerShow.layout = {
    breadcrumbs: [{ title: "Customers", href: index() }],
};
