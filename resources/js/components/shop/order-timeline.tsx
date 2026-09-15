import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from '@/types';
import type { OrderStatus, OrderStatusHistory } from '@/types';

export function OrderTimeline({
    status,
    statusHistories,
}: {
    status: OrderStatus;
    statusHistories: OrderStatusHistory[];
}) {
    if (status === 'cancelled') {
        return (
            <div className="text-destructive flex items-center gap-2 text-sm">
                <Check className="size-4" /> Order Cancelled
            </div>
        );
    }

    const occurred = new Set(statusHistories.map((h) => h.status));
    const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status);

    return (
        <ol className="space-y-3">
            {ORDER_STATUS_SEQUENCE.map((step, index) => {
                const isDone = occurred.has(step) || index <= currentIndex;
                const history = statusHistories.find((h) => h.status === step);

                return (
                    <li key={step} className="flex items-start gap-3 text-sm">
                        <span
                            className={cn(
                                'flex size-5 shrink-0 items-center justify-center rounded-full border text-xs',
                                isDone
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'text-muted-foreground border-muted-foreground/30',
                            )}
                        >
                            {isDone ? <Check className="size-3" /> : '○'}
                        </span>
                        <div>
                            <p
                                className={
                                    isDone
                                        ? 'font-medium'
                                        : 'text-muted-foreground'
                                }
                            >
                                {ORDER_STATUS_LABELS[step]}
                            </p>
                            {history && (
                                <p className="text-muted-foreground text-xs">
                                    {new Date(
                                        history.created_at,
                                    ).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
