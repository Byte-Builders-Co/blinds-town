import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import InputError from "@/components/input-error";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { OrderTimeline } from "@/components/shop/order-timeline";
import { PaymentStatusBadge } from "@/components/shop/payment-status-badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
    index,
    refund,
    updateStatus,
    updateTracking,
} from "@/routes/admin/orders";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/types";
import type { Order, OrderStatus } from "@/types";

export default function AdminOrderShow({
    order,
    statuses,
}: {
    order: Order;
    statuses: OrderStatus[];
}) {
    const statusForm = useForm({ status: order.status, note: "" });
    const trackingForm = useForm({
        carrier: order.carrier ?? "",
        tracking_number: order.tracking_number ?? "",
    });
    const refundForm = useForm({
        amount: order.payment?.amount ?? "",
        reason: "",
    });

    const submitStatus = () => {
        statusForm.patch(updateStatus(order).url, { preserveScroll: true });
    };

    const submitTracking = () => {
        trackingForm.patch(updateTracking(order).url, { preserveScroll: true });
    };

    const submitRefund = () => {
        refundForm.post(refund(order).url, { preserveScroll: true });
    };

    const canRefund = order.payment?.status === "paid";
    const [showRefundForm, setShowRefundForm] = useState(false);

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="p-4 md:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <h1 className="text-2xl font-semibold">
                            {order.order_number}
                        </h1>
                        <span className="text-muted-foreground text-sm">
                            Placed{" "}
                            {new Date(order.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        {order.payment && (
                            <PaymentStatusBadge status={order.payment.status} />
                        )}
                    </div>
                </div>

                <div className="mt-3 grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {order.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            {item.product?.image_path ? (
                                                <img
                                                    src={`/storage/${item.product.image_path}`}
                                                    alt={item.product_name}
                                                    className="size-16 shrink-0 rounded-md border object-cover"
                                                />
                                            ) : (
                                                <div className="bg-muted text-muted-foreground flex size-16 shrink-0 items-center justify-center rounded-md border text-xs">
                                                    No image
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">
                                                    {item.product_name}{" "}
                                                    &times; {item.quantity}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    {item.width_cm}cm &times;{" "}
                                                    {item.height_cm}cm
                                                    {item.selected_options &&
                                                        item.selected_options
                                                            .length > 0 &&
                                                        ` · ${item.selected_options.map((o) => o.label).join(", ")}`}
                                                </p>
                                                {item.measurement_photo_path && (
                                                    <a
                                                        href={`/storage/${item.measurement_photo_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-primary text-xs underline"
                                                    >
                                                        View measurement photo
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-medium whitespace-nowrap">
                                            {formatCurrency(
                                                item.line_total,
                                                order.currency,
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <div className="text-muted-foreground flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>
                                        {formatCurrency(
                                            order.subtotal,
                                            order.currency,
                                        )}
                                    </span>
                                </div>
                                {Number(order.discount_amount) > 0 && (
                                    <div className="text-muted-foreground flex justify-between text-sm">
                                        <span>Discount</span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                order.discount_amount,
                                                order.currency,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {Number(order.shipping_charge) > 0 && (
                                    <div className="text-muted-foreground flex justify-between text-sm">
                                        <span>Shipping</span>
                                        <span>
                                            {formatCurrency(
                                                order.shipping_charge,
                                                order.currency,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {order.installation_requested && (
                                    <div className="text-muted-foreground flex justify-between text-sm">
                                        <span>Installation</span>
                                        <span>
                                            {formatCurrency(
                                                order.installation_charge,
                                                order.currency,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {Number(order.tax_amount) > 0 && (
                                    <div className="text-muted-foreground flex justify-between text-sm">
                                        <span>GST / Tax</span>
                                        <span>
                                            {formatCurrency(
                                                order.tax_amount,
                                                order.currency,
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {formatCurrency(
                                            order.total,
                                            order.currency,
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Order Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <OrderTimeline
                                    status={order.status}
                                    statusHistories={
                                        order.statusHistories ?? []
                                    }
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Status</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">
                                        Status
                                    </Label>
                                    <Select
                                        value={statusForm.data.status}
                                        onValueChange={(value) =>
                                            statusForm.setData(
                                                "status",
                                                value as OrderStatus,
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
                                                        ORDER_STATUS_LABELS[
                                                            status
                                                        ]
                                                    }
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={statusForm.errors.status}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">
                                        Note (optional)
                                    </Label>
                                    <Input
                                        value={statusForm.data.note}
                                        onChange={(e) =>
                                            statusForm.setData(
                                                "note",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={submitStatus}
                                    disabled={statusForm.processing}
                                >
                                    Update Status
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tracking Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">
                                        Carrier
                                    </Label>
                                    <Input
                                        value={trackingForm.data.carrier}
                                        onChange={(e) =>
                                            trackingForm.setData(
                                                "carrier",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={trackingForm.errors.carrier}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">
                                        Tracking Number
                                    </Label>
                                    <Input
                                        value={
                                            trackingForm.data.tracking_number
                                        }
                                        onChange={(e) =>
                                            trackingForm.setData(
                                                "tracking_number",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            trackingForm.errors
                                                .tracking_number
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={submitTracking}
                                    disabled={trackingForm.processing}
                                >
                                    Save Tracking
                                </Button>
                            </CardContent>
                        </Card>

                        {order.payment && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-muted-foreground space-y-1 text-sm">
                                        <p>
                                            Method:{" "}
                                            {
                                                PAYMENT_METHOD_LABELS[
                                                    order.payment.method
                                                ]
                                            }
                                        </p>
                                        <p>
                                            Amount:{" "}
                                            {formatCurrency(
                                                order.payment.amount,
                                                order.currency,
                                            )}
                                        </p>
                                        {order.payment
                                            .gateway_transaction_id && (
                                            <p className="break-all">
                                                Transaction:{" "}
                                                {
                                                    order.payment
                                                        .gateway_transaction_id
                                                }
                                            </p>
                                        )}
                                        {order.payment.failure_reason && (
                                            <p className="text-destructive">
                                                Failure:{" "}
                                                {order.payment.failure_reason}
                                            </p>
                                        )}
                                    </div>

                                    {order.payment.refunds &&
                                        order.payment.refunds.length > 0 && (
                                            <div className="space-y-1 text-sm">
                                                <p className="font-medium">
                                                    Refunds
                                                </p>
                                                {order.payment.refunds.map(
                                                    (r) => (
                                                        <p
                                                            key={r.id}
                                                            className="text-muted-foreground"
                                                        >
                                                            {formatCurrency(
                                                                r.amount,
                                                                order.currency,
                                                            )}{" "}
                                                            — {r.status}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    {canRefund &&
                                        (showRefundForm ? (
                                            <div className="grid gap-3 rounded-lg border p-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium">
                                                        Process Refund
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowRefundForm(
                                                                false,
                                                            )
                                                        }
                                                        className="text-muted-foreground text-xs hover:underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label className="text-xs">
                                                        Amount
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            refundForm.data
                                                                .amount
                                                        }
                                                        onChange={(e) =>
                                                            refundForm.setData(
                                                                "amount",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label className="text-xs">
                                                        Reason
                                                    </Label>
                                                    <Input
                                                        value={
                                                            refundForm.data
                                                                .reason
                                                        }
                                                        onChange={(e) =>
                                                            refundForm.setData(
                                                                "reason",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        refundForm.errors
                                                            .amount
                                                    }
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={submitRefund}
                                                    disabled={
                                                        refundForm.processing
                                                    }
                                                >
                                                    Refund
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                    setShowRefundForm(true)
                                                }
                                            >
                                                Process Refund
                                            </Button>
                                        ))}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping to</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    {order.shipping_name}
                                    <br />
                                    {order.shipping_line1}
                                    {order.shipping_line2 && (
                                        <>
                                            <br />
                                            {order.shipping_line2}
                                        </>
                                    )}
                                    <br />
                                    {order.shipping_city},{" "}
                                    {order.shipping_postal_code}
                                    <br />
                                    {order.shipping_country}
                                    <br />
                                    {order.shipping_phone}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = {
    breadcrumbs: [
        { title: "Orders", href: index() },
        { title: "Order", href: "#" },
    ],
};
