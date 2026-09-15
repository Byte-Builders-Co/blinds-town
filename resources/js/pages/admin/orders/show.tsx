import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderTimeline } from '@/components/shop/order-timeline';
import { PaymentStatusBadge } from '@/components/shop/payment-status-badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import {
    index,
    refund,
    updateStatus,
    updateTracking,
} from '@/routes/admin/orders';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/types';
import type { Order, OrderStatus } from '@/types';

export default function AdminOrderShow({
    order,
    statuses,
}: {
    order: Order;
    statuses: OrderStatus[];
}) {
    const statusForm = useForm({ status: order.status, note: '' });
    const trackingForm = useForm({
        carrier: order.carrier ?? '',
        tracking_number: order.tracking_number ?? '',
    });
    const refundForm = useForm({
        amount: order.payment?.amount ?? '',
        reason: '',
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

    const canRefund = order.payment?.status === 'paid';

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="max-w-3xl p-4">
                <h1 className="text-2xl font-semibold">{order.order_number}</h1>
                <p className="text-muted-foreground text-sm">
                    Placed {new Date(order.created_at).toLocaleDateString()}
                </p>

                <div className="mt-4 flex items-center gap-2">
                    <Badge variant="secondary">
                        {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    {order.payment && (
                        <PaymentStatusBadge status={order.payment.status} />
                    )}
                </div>

                <div className="mt-6 grid gap-3 rounded-lg border p-4">
                    <h2 className="font-medium">Update Status</h2>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">
                                Status
                            </Label>
                            <Select
                                value={statusForm.data.status}
                                onValueChange={(value) =>
                                    statusForm.setData(
                                        'status',
                                        value as OrderStatus,
                                    )
                                }
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {ORDER_STATUS_LABELS[status]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={statusForm.errors.status} />
                        </div>
                        <div className="grid flex-1 gap-2">
                            <Label className="text-sm font-medium">
                                Note (optional)
                            </Label>
                            <Input
                                value={statusForm.data.note}
                                onChange={(e) =>
                                    statusForm.setData('note', e.target.value)
                                }
                            />
                        </div>
                        <Button
                            onClick={submitStatus}
                            disabled={statusForm.processing}
                        >
                            Update Status
                        </Button>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-lg border p-4">
                    <h2 className="font-medium">Tracking Information</h2>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">
                                Carrier
                            </Label>
                            <Input
                                value={trackingForm.data.carrier}
                                onChange={(e) =>
                                    trackingForm.setData(
                                        'carrier',
                                        e.target.value,
                                    )
                                }
                                className="w-48"
                            />
                            <InputError message={trackingForm.errors.carrier} />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">
                                Tracking Number
                            </Label>
                            <Input
                                value={trackingForm.data.tracking_number}
                                onChange={(e) =>
                                    trackingForm.setData(
                                        'tracking_number',
                                        e.target.value,
                                    )
                                }
                                className="w-48"
                            />
                            <InputError
                                message={trackingForm.errors.tracking_number}
                            />
                        </div>
                        <Button
                            onClick={submitTracking}
                            disabled={trackingForm.processing}
                        >
                            Save Tracking
                        </Button>
                    </div>
                </div>

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

                    {order.payment && (
                        <div>
                            <h2 className="font-semibold">Payment</h2>
                            <div className="text-muted-foreground mt-3 space-y-1 text-sm">
                                <p>
                                    Method:{' '}
                                    {
                                        PAYMENT_METHOD_LABELS[
                                            order.payment.method
                                        ]
                                    }
                                </p>
                                <p>
                                    Amount:{' '}
                                    {formatCurrency(
                                        order.payment.amount,
                                        order.currency,
                                    )}
                                </p>
                                {order.payment.gateway_transaction_id && (
                                    <p>
                                        Transaction:{' '}
                                        {order.payment.gateway_transaction_id}
                                    </p>
                                )}
                                {order.payment.failure_reason && (
                                    <p className="text-destructive">
                                        Failure: {order.payment.failure_reason}
                                    </p>
                                )}
                            </div>

                            {order.payment.refunds &&
                                order.payment.refunds.length > 0 && (
                                    <div className="mt-3 space-y-1 text-sm">
                                        <p className="font-medium">Refunds</p>
                                        {order.payment.refunds.map((r) => (
                                            <p
                                                key={r.id}
                                                className="text-muted-foreground"
                                            >
                                                {formatCurrency(
                                                    r.amount,
                                                    order.currency,
                                                )}{' '}
                                                — {r.status}
                                            </p>
                                        ))}
                                    </div>
                                )}

                            {canRefund && (
                                <div className="mt-4 space-y-2 rounded-lg border p-3">
                                    <p className="text-sm font-medium">
                                        Process Refund
                                    </p>
                                    <div className="flex items-end gap-2">
                                        <div className="grid gap-1">
                                            <Label className="text-xs">
                                                Amount
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={refundForm.data.amount}
                                                onChange={(e) =>
                                                    refundForm.setData(
                                                        'amount',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-28"
                                            />
                                        </div>
                                        <div className="grid flex-1 gap-1">
                                            <Label className="text-xs">
                                                Reason
                                            </Label>
                                            <Input
                                                value={refundForm.data.reason}
                                                onChange={(e) =>
                                                    refundForm.setData(
                                                        'reason',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={submitRefund}
                                            disabled={refundForm.processing}
                                        >
                                            Refund
                                        </Button>
                                    </div>
                                    <InputError
                                        message={refundForm.errors.amount}
                                    />
                                </div>
                            )}
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
                                        ` · ${item.selected_options.map((o) => o.label).join(', ')}`}
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
            </div>
        </>
    );
}

AdminOrderShow.layout = {
    breadcrumbs: [
        { title: 'Orders', href: index() },
        { title: 'Order', href: '#' },
    ],
};
