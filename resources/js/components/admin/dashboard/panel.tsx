import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    /** Let the content run edge to edge (tables). */
    flush?: boolean;
};

/**
 * The shared frame for every dashboard section: a quiet card with a title
 * row, so spacing and hierarchy stay identical across the page.
 */
export function Panel({
    title,
    description,
    action,
    children,
    className,
    flush,
}: Props) {
    return (
        <Card
            className={cn("min-w-0 gap-0 rounded-md py-0 shadow-xs", className)}
        >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-5">
                <div className="min-w-0">
                    <h2 className="text-foreground text-[15px] leading-tight font-semibold tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-muted-foreground mt-1 text-xs">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
            <div className={cn("flex-1", flush ? "mt-4" : "px-5 pt-4 pb-5")}>
                {children}
            </div>
        </Card>
    );
}

export function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <span className="bg-muted text-muted-foreground mb-3 grid size-10 place-items-center rounded-full">
                <Icon className="size-5" />
            </span>
            <p className="text-sm font-medium">{title}</p>
            {description && (
                <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                    {description}
                </p>
            )}
        </div>
    );
}
