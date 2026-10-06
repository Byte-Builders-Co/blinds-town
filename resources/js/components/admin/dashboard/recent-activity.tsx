import { Link } from "@inertiajs/react";
import {
    Activity,
    PackagePlus,
    PackageCheck,
    Pencil,
    ReceiptText,
    Truck,
    Undo2,
    UserPlus,
    Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { show as showCustomer } from "@/routes/admin/customers";
import { show as showOrder } from "@/routes/admin/orders";
import { show as showProduct } from "@/routes/admin/products";
import type { DashboardActivity, DashboardActivityType } from "@/types";
import { EmptyState, Panel } from "./panel";

const STYLES: Record<
    DashboardActivityType,
    { icon: LucideIcon; className: string }
> = {
    order_received: {
        icon: ReceiptText,
        className: "bg-chart-1/10 text-chart-1",
    },
    order_shipped: {
        icon: Truck,
        className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    },
    payment_received: {
        icon: Wallet,
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    refund_processed: {
        icon: Undo2,
        className: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
    customer_registered: {
        icon: UserPlus,
        className: "bg-chart-3/10 text-chart-3",
    },
    product_added: {
        icon: PackagePlus,
        className: "bg-chart-2/10 text-chart-2",
    },
    product_updated: {
        icon: Pencil,
        className: "bg-muted text-muted-foreground",
    },
};

function href(subject: DashboardActivity["subject"]) {
    if (!subject) {
        return null;
    }

    switch (subject.type) {
        case "order":
            return showOrder(subject.id);
        case "customer":
            return showCustomer(subject.id);
        case "product":
            return showProduct(subject.id);
    }
}

export function RecentActivity({
    activity,
}: {
    activity: DashboardActivity[];
}) {
    return (
        <Panel
            title="Recent Activity"
            description="What happened in the store lately"
        >
            {activity.length === 0 ? (
                <EmptyState icon={Activity} title="No activity yet" />
            ) : (
                <ol className="relative space-y-5">
                    {/* The rail the icons sit on. */}
                    <span
                        className="bg-border absolute top-2 bottom-2 left-4 w-px"
                        aria-hidden="true"
                    />
                    {activity.map((entry, index) => {
                        const style = STYLES[entry.type] ?? {
                            icon: PackageCheck,
                            className: "bg-muted text-muted-foreground",
                        };
                        const Icon = style.icon;
                        const link = href(entry.subject);
                        const body = (
                            <>
                                <p className="text-sm leading-snug font-medium">
                                    {entry.title}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                    {entry.description}
                                </p>
                            </>
                        );

                        return (
                            <li
                                key={`${entry.type}-${entry.at}-${index}`}
                                className="relative flex gap-3"
                            >
                                <span
                                    className={cn(
                                        "ring-card relative z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4",
                                        style.className,
                                    )}
                                >
                                    <Icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div className="min-w-0 flex-1">
                                    {link ? (
                                        <Link
                                            href={link}
                                            className="hover:text-primary block transition-colors"
                                        >
                                            {body}
                                        </Link>
                                    ) : (
                                        body
                                    )}
                                </div>
                                <time
                                    dateTime={entry.at}
                                    title={new Date(entry.at).toLocaleString()}
                                    className="text-muted-foreground shrink-0 pt-0.5 text-xs whitespace-nowrap"
                                >
                                    {formatRelativeTime(entry.at)}
                                </time>
                            </li>
                        );
                    })}
                </ol>
            )}
        </Panel>
    );
}
