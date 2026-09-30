import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/types";
import type { OrderStatus } from "@/types";

const COLORS: Record<OrderStatus, string> = {
    pending:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    measurement_pending:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    manufacturing:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    ready_to_ship:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    shipped: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    delivered:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    return (
        <Badge className={cn("border-transparent", COLORS[status])}>
            {ORDER_STATUS_LABELS[status]}
        </Badge>
    );
}
