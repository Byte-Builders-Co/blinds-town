import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types/auth";

export const USER_STATUS_DOT: Record<UserStatus, string> = {
    active: "bg-emerald-500",
    inactive: "bg-slate-400",
    blocked: "bg-red-500",
};

/**
 * A coloured dot followed by plain text. Used in admin tables in place of
 * filled badges so statuses read without adding boxes to the row.
 */
export function StatusDot({
    label,
    dotClassName,
    muted = false,
    className,
}: {
    label: string;
    dotClassName: string;
    muted?: boolean;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap",
                muted && "text-muted-foreground",
                className,
            )}
        >
            <span
                className={cn("size-1.5 shrink-0 rounded-full", dotClassName)}
                aria-hidden="true"
            />
            {label}
        </span>
    );
}
