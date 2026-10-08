import { Head, useForm } from "@inertiajs/react";
import { PackageSearch } from "lucide-react";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { OrderTimeline } from "@/components/shop/order-timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackOrder } from "@/routes";
import type { OrderStatus, OrderStatusHistory } from "@/types";

type TrackedOrder = {
    order_number: string;
    status: OrderStatus;
    tracking_number: string;
    created_at: string;
    shipped_at: string | null;
    delivered_at: string | null;
    items: { id: number; product_name: string; quantity: number }[];
    statusHistories: OrderStatusHistory[];
};

export default function TrackOrder({
    trackingNumber,
    searched,
    order,
}: {
    trackingNumber: string;
    searched: boolean;
    order: TrackedOrder | null;
}) {
    const form = useForm({ tracking_number: trackingNumber });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            tracking_number: data.tracking_number.trim(),
        }));
        form.get(trackOrder().url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Track Order" />

            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Track your order
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Enter the tracking number we sent you to see where your
                    order is.
                </p>

                <form onSubmit={submit} className="mt-6 flex gap-2">
                    <Input
                        value={form.data.tracking_number}
                        onChange={(e) =>
                            form.setData("tracking_number", e.target.value)
                        }
                        placeholder="Tracking number"
                        aria-label="Tracking number"
                        required
                    />
                    <Button type="submit" disabled={form.processing}>
                        Track
                    </Button>
                </form>

                {searched && !order && (
                    <div className="bg-muted mt-8 flex items-start gap-3 rounded-md p-4 text-sm">
                        <PackageSearch className="mt-0.5 size-4 shrink-0" />
                        <p>
                            We couldn&apos;t find an order with that tracking
                            number. Check it and try again.
                        </p>
                    </div>
                )}

                {order && (
                    <div className="mt-8 space-y-6 rounded-lg border p-6">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-lg font-semibold">
                                    {order.order_number}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Placed{" "}
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>

                        <div className="text-muted-foreground space-y-1 text-sm">
                            <p>Tracking number: {order.tracking_number}</p>
                            {order.shipped_at && (
                                <p>
                                    Shipped{" "}
                                    {new Date(
                                        order.shipped_at,
                                    ).toLocaleDateString()}
                                </p>
                            )}
                            {order.delivered_at && (
                                <p>
                                    Delivered{" "}
                                    {new Date(
                                        order.delivered_at,
                                    ).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div>
                            <h2 className="font-semibold">Order Timeline</h2>
                            <div className="mt-3">
                                <OrderTimeline
                                    status={order.status}
                                    statusHistories={order.statusHistories}
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="font-semibold">Items</h2>
                            <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                                {order.items.map((item) => (
                                    <li key={item.id}>
                                        {item.product_name} &times;{" "}
                                        {item.quantity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
