import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Head, Link } from '@inertiajs/react';
import { type FormEvent, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { index as cartIndex } from '@/routes/cart';
import { success } from '@/routes/checkout';
import type { Order } from '@/types';

function PaymentForm({ order }: { order: Order }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const submittedRef = useRef(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || submittedRef.current) {
            return;
        }

        submittedRef.current = true;
        setIsProcessing(true);
        setErrorMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: new URL(
                    success(order.id).url,
                    window.location.origin,
                ).toString(),
            },
        });

        // A rejected/declined payment resolves here with `error` instead of
        // redirecting, so the customer can see what happened and try again.
        if (error) {
            setErrorMessage(
                error.message ??
                    'Your payment could not be completed. Please try again.',
            );
            setIsProcessing(false);
            submittedRef.current = false;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <p className="text-destructive text-sm" role="alert">
                    {errorMessage}
                </p>
            )}

            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!stripe || !elements || isProcessing}
            >
                {isProcessing
                    ? 'Processing…'
                    : `Pay ${formatCurrency(order.total, order.currency)}`}
            </Button>
        </form>
    );
}

export default function CheckoutPay({
    order,
    clientSecret,
    stripePublishableKey,
}: {
    order: Order;
    clientSecret: string;
    stripePublishableKey: string;
}) {
    const stripePromise = useMemo<Promise<Stripe | null>>(
        () => loadStripe(stripePublishableKey),
        [stripePublishableKey],
    );

    return (
        <>
            <Head title="Payment" />

            <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold">Complete payment</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Order {order.order_number} &middot;{' '}
                    {formatCurrency(order.total, order.currency)}
                </p>

                <div className="mt-8">
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm order={order} />
                    </Elements>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href={cartIndex()}
                        className="text-muted-foreground text-sm underline"
                    >
                        Cancel and return to cart
                    </Link>
                </div>
            </div>
        </>
    );
}
