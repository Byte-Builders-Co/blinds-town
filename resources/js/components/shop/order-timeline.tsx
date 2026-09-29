import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "@/types";
import type { OrderStatus, OrderStatusHistory } from "@/types";

export function OrderTimeline({
    status,
    statusHistories,
}: {
    status: OrderStatus;
    statusHistories: OrderStatusHistory[];
}) {
    if (status === "cancelled") {
        return (
            <div className="text-destructive flex items-center gap-2 text-sm">
                <Check className="size-4" /> Order Cancelled
            </div>
        );
    }

    const occurred = new Set(statusHistories.map((h) => h.status));
    const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status);

    return (
        <div className="overflow-x-auto">
            <ol className="flex min-w-max items-start">
                {ORDER_STATUS_SEQUENCE.map((step, index) => {
                    const isDone = occurred.has(step) || index <= currentIndex;
                    const isLast = index === ORDER_STATUS_SEQUENCE.length - 1;
                    const history = statusHistories.find(
                        (h) => h.status === step,
                    );

                    return (
                        <li
                            key={step}
                            className={cn(
                                "flex flex-col",
                                !isLast && "flex-1",
                            )}
                        >
                            <div className="flex items-center">
                                <span
                                    className={cn(
                                        "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                                        isDone
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "bg-background text-muted-foreground border-muted-foreground/30",
                                    )}
                                >
                                    {isDone ? (
                                        <Check className="size-3" />
                                    ) : (
                                        "○"
                                    )}
                                </span>
                                {!isLast && (
                                    <span
                                        aria-hidden
                                        className={cn(
                                            "mx-1 h-0.5 min-w-8 flex-1",
                                            isDone
                                                ? "bg-primary"
                                                : "bg-muted-foreground/30",
                                        )}
                                    />
                                )}
                            </div>
                            <div className="mt-2 max-w-24 pr-2 text-xs">
                                <p
                                    className={
                                        isDone
                                            ? "font-medium"
                                            : "text-muted-foreground"
                                    }
                                >
                                    {ORDER_STATUS_LABELS[step]}
                                </p>
                                {history && (
                                    <p className="text-muted-foreground text-[11px]">
                                        {new Date(
                                            history.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
