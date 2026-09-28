import { Head, Link, useForm } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/shop/order-timeline";
import { PaymentStatusBadge } from "@/components/shop/payment-status-badge";
import { formatCurrency } from "@/lib/utils";
import { retry } from "@/routes/checkout";
import { invoice } from "@/routes/orders";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/types";
import type { Order } from "@/types";

export default function OrderShow({ order }: { order: Order }) {
    const retryForm = useForm({});
    const canRetryPayment =
        order.status === "pending" &&
        order.payment?.method === "online" &&
        order.payment.status !== "paid";

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {order.order_number}
                    </h1>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                        {order.payment && (
                            <PaymentStatusBadge status={order.payment.status} />
                        )}
                    </div>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                    Placed {new Date(order.created_at).toLocaleDateString()}
                </p>

                {canRetryPayment && (
                    <div className="bg-destructive/10 mt-4 rounded-md p-4 text-sm">
                        <p className="font-medium">Payment Failed</p>
                        <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => retryForm.post(retry(order.id).url)}
                            disabled={retryForm.processing}
                        >
                            Retry Payment
                        </Button>
                    </div>
                )}

                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div>
                        <h2 className="font-semibold">Order Timeline</h2>
                        <div className="mt-3">
                            <OrderTimeline
                                status={order.status}
                                statusHistories={order.statusHistories ?? []}
                            />
                        </div>
                    </div>

                    {(order.carrier || order.tracking_number) && (
                        <div>
                            <h2 className="font-semibold">Delivery Tracking</h2>
                            <div className="text-muted-foreground mt-3 space-y-1 text-sm">
                                {order.carrier && (
                                    <p>Carrier: {order.carrier}</p>
                                )}
                                {order.tracking_number && (
                                    <p>
                                        Tracking number: {order.tracking_number}
                                    </p>
                                )}
                                {order.shipped_at && (
                                    <p>
                                        Shipped{" "}
                                        {new Date(
                                            order.shipped_at,
                                        ).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 divide-y">
                    {order.items?.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between py-4"
                        >
                            <div>
                                <p className="font-medium">
                                    {item.product_name} &times; {item.quantity}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {item.width_cm}cm &times; {item.height_cm}
                                    cm
                                    {item.selected_options &&
                                        item.selected_options.length > 0 &&
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
                            <p className="font-medium">
                                {formatCurrency(
                                    item.line_total,
                                    order.currency,
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 space-y-1 border-t pt-4">
                    <div className="text-muted-foreground flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>
                            {formatCurrency(order.subtotal, order.currency)}
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
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>
                            {formatCurrency(order.total, order.currency)}
                        </span>
                    </div>
                </div>

                {order.payment && (
                    <div className="mt-8">
                        <h2 className="font-semibold">Payment</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {PAYMENT_METHOD_LABELS[order.payment.method]}
                            {order.payment.gateway_transaction_id &&
                                ` · Transaction ${order.payment.gateway_transaction_id}`}
                        </p>
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="font-semibold">Shipping to</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
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
                        {order.shipping_city}, {order.shipping_postal_code}
                        <br />
                        {order.shipping_country}
                        <br />
                        {order.shipping_phone}
                    </p>
                </div>

                <div className="mt-8">
                    <Button variant="outline" asChild>
                        <Link href={invoice(order.order_number)}>
                            View Invoice
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
