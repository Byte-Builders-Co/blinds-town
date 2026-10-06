import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/types";
import type { OrderStatus, PaymentStatus } from "@/types";

function Pill({ label, className }: { label: string; className: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                className,
            )}
        >
            <span
                className="size-1.5 shrink-0 rounded-full bg-current"
                aria-hidden="true"
            />
            {label}
        </span>
    );
}

const ORDER_STYLES: Record<OrderStatus, string> = {
    pending: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    measurement_pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    manufacturing: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    ready_to_ship: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    shipped: "bg-cyan-500/10 text-cyan-800 dark:text-cyan-300",
    delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
    pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    processing: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    failed: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    cancelled: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    refunded: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    partially_refunded: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
    return (
        <Pill
            label={ORDER_STATUS_LABELS[status]}
            className={ORDER_STYLES[status]}
        />
    );
}

export function PaymentStatusPill({
    status,
}: {
    status: PaymentStatus | null;
}) {
    if (status === null) {
        return <span className="text-muted-foreground text-xs">—</span>;
    }

    return (
        <Pill
            label={PAYMENT_STATUS_LABELS[status]}
            className={PAYMENT_STYLES[status]}
        />
    );
}
