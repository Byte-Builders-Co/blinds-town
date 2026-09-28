import { Head, Link, useForm } from "@inertiajs/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { home } from "@/routes";
import { retry } from "@/routes/checkout";
import { show } from "@/routes/orders";
import type { Order } from "@/types";

export default function CheckoutSuccess({ order }: { order: Order }) {
    const isConfirmed = order.status !== "pending";
    const paymentFailed = order.payment?.status === "failed";
    const retryForm = useForm({});

    const retryPayment = () => {
        retryForm.post(retry(order.id).url);
    };

    return (
        <>
            <Head title="Order Confirmed" />

            <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6 lg:px-8">
                {isConfirmed ? (
                    <>
                        <CheckCircle2 className="text-primary mx-auto size-12" />
                        <h1 className="mt-4 text-2xl font-semibold">
                            Order confirmed
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Order {order.order_number} has been confirmed.
                            Total: {formatCurrency(order.total, order.currency)}
                        </p>
                    </>
                ) : paymentFailed ? (
                    <>
                        <XCircle className="text-destructive mx-auto size-12" />
                        <h1 className="mt-4 text-2xl font-semibold">
                            Payment failed
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Order {order.order_number} — Payment Failed
                        </p>
                        <Button
                            className="mt-6"
                            onClick={retryPayment}
                            disabled={retryForm.processing}
                        >
                            Retry Payment
                        </Button>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-semibold">
                            Finalising your order&hellip;
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            We're confirming your payment. Refresh this page in
                            a moment, or check your order below.
                        </p>
                    </>
                )}

                <div className="mt-8 flex justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href={home()}>Continue shopping</Link>
                    </Button>
                    <Button asChild>
                        <Link href={show(order.order_number)}>View order</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
