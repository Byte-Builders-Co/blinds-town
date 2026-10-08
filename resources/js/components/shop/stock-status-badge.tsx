import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STOCK_STATUS_LABELS } from "@/types";
import type { StockStatus } from "@/types";

const COLORS: Record<StockStatus, string> = {
    in_stock: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    out_of_stock: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300",
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
    return (
        <Badge className={cn("border-transparent", COLORS[status])}>
            {STOCK_STATUS_LABELS[status]}
        </Badge>
    );
}
