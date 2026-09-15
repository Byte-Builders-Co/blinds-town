import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/types';
import type { Order } from '@/types';

export default function Invoice({ order }: { order: Order }) {
    return (
        <>
            <Head title={`Invoice ${order.order_number}`} />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 print:px-0 print:py-0">
                <div className="flex items-center justify-between print:hidden">
                    <h1 className="text-2xl font-semibold">Invoice</h1>
                    <Button onClick={() => window.print()}>
                        <Printer /> Print / Download
                    </Button>
                </div>

                <div className="mt-8 rounded-lg border p-8 print:border-none print:p-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-lg font-semibold">Blinds Town</p>
                            <p className="text-muted-foreground text-sm">
                                Made-to-measure window blinds
                            </p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-medium">
                                Invoice #{order.order_number}
                            </p>
                            <p className="text-muted-foreground">
                                {new Date(
                                    order.created_at,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <p className="text-muted-foreground font-medium">
                                Billed to
                            </p>
                            <p className="mt-1">{order.shipping_name}</p>
                            <p>{order.shipping_phone}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground font-medium">
                                Shipping address
                            </p>
                            <p className="mt-1">
                                {order.shipping_line1}
                                {order.shipping_line2 &&
                                    `, ${order.shipping_line2}`}
                            </p>
                            <p>
                                {order.shipping_city},{' '}
                                {order.shipping_postal_code}
                            </p>
                            <p>{order.shipping_country}</p>
                        </div>
                    </div>

                    <table className="mt-8 w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="pb-2">Item</th>
                                <th className="pb-2">Measurements</th>
                                <th className="pb-2 text-right">Qty</th>
                                <th className="pb-2 text-right">Unit Price</th>
                                <th className="pb-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-2">
                                        {item.product_name}
                                        {item.selected_options &&
                                            item.selected_options.length >
                                                0 && (
                                                <p className="text-muted-foreground text-xs">
                                                    {item.selected_options
                                                        .map((o) => o.label)
                                                        .join(', ')}
                                                </p>
                                            )}
                                    </td>
                                    <td className="py-2">
                                        {item.width_cm}cm &times;{' '}
                                        {item.height_cm}cm
                                    </td>
                                    <td className="py-2 text-right">
                                        {item.quantity}
                                    </td>
                                    <td className="py-2 text-right">
                                        {formatCurrency(
                                            item.unit_price,
                                            order.currency,
                                        )}
                                    </td>
                                    <td className="py-2 text-right">
                                        {formatCurrency(
                                            item.line_total,
                                            order.currency,
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>
                                {formatCurrency(order.subtotal, order.currency)}
                            </span>
                        </div>
                        {Number(order.discount_amount) > 0 && (
                            <div className="flex justify-between">
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
                            <div className="flex justify-between">
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
                            <div className="flex justify-between">
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
                            <div className="flex justify-between">
                                <span>GST / Tax</span>
                                <span>
                                    {formatCurrency(
                                        order.tax_amount,
                                        order.currency,
                                    )}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-1 font-semibold">
                            <span>Grand Total</span>
                            <span>
                                {formatCurrency(order.total, order.currency)}
                            </span>
                        </div>
                    </div>

                    {order.payment && (
                        <div className="mt-8 border-t pt-4 text-sm">
                            <p>
                                <span className="text-muted-foreground">
                                    Payment method:
                                </span>{' '}
                                {PAYMENT_METHOD_LABELS[order.payment.method]}
                            </p>
                            <p>
                                <span className="text-muted-foreground">
                                    Payment status:
                                </span>{' '}
                                {PAYMENT_STATUS_LABELS[order.payment.status]}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
