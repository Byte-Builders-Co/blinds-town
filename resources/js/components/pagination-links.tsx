import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Paginated } from "@/types";

type LinkData = { url: string | null; label: string; active: boolean };

function PaginationButton({
    link,
    icon,
}: {
    link: LinkData;
    icon?: ReactNode;
}) {
    const className = cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-3 text-sm shadow-xs transition-colors",
        link.active
            ? "bg-primary text-primary-foreground border-primary"
            : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
    );

    const content = icon ?? (
        <span dangerouslySetInnerHTML={{ __html: link.label }} />
    );

    if (!link.url) {
        return (
            <span
                className={cn(
                    className,
                    "text-muted-foreground/50 cursor-not-allowed",
                )}
            >
                {content}
            </span>
        );
    }

    return (
        <Link href={link.url} preserveScroll className={className}>
            {content}
        </Link>
    );
}

export function PaginationLinks<T>({
    paginated,
    label = "records",
}: {
    paginated: Pick<
        Paginated<T>,
        "links" | "last_page" | "from" | "to" | "total"
    >;
    label?: string;
}) {
    const [previous, ...rest] = paginated.links;
    const next = rest.pop();
    const pages = rest;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
                Showing{" "}
                <span className="text-foreground font-medium">
                    {paginated.from ?? 0}
                </span>{" "}
                to{" "}
                <span className="text-foreground font-medium">
                    {paginated.to ?? 0}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-medium">
                    {paginated.total}
                </span>{" "}
                {label}
            </p>

            {paginated.last_page > 1 && (
                <nav className="flex flex-wrap items-center gap-1">
                    <PaginationButton
                        link={previous}
                        icon={<ChevronLeft className="size-4" />}
                    />
                    {pages.map((link, index) => (
                        <PaginationButton key={index} link={link} />
                    ))}
                    {next && (
                        <PaginationButton
                            link={next}
                            icon={<ChevronRight className="size-4" />}
                        />
                    )}
                </nav>
            )}
        </div>
    );
}
