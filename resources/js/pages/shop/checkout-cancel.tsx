import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { index as cartIndex } from "@/routes/cart";
import { retry } from "@/routes/checkout";
import type { Order } from "@/types";

export default function CheckoutCancel({ order }: { order: Order }) {
    const retryForm = useForm({});

    const retryPayment = () => {
        retryForm.post(retry(order.id).url);
    };

    return (
        <>
            <Head title="Checkout Cancelled" />

            <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold">Checkout cancelled</h1>
                <p className="text-muted-foreground mt-2">
                    Order {order.order_number} was not completed. Your cart has
                    been kept, and you can try again whenever you&apos;re ready.
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href={cartIndex()}>Back to cart</Link>
                    </Button>
                    <Button
                        onClick={retryPayment}
                        disabled={retryForm.processing}
                    >
                        Retry Payment
                    </Button>
                </div>
            </div>
        </>
    );
}
