import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

export function PaginationLinks<T>({
    paginated,
}: {
    paginated: Pick<Paginated<T>, 'links' | 'last_page'>;
}) {
    if (paginated.last_page <= 1) {
        return null;
    }

    return (
        <nav className="flex flex-wrap items-center gap-1">
            {paginated.links.map((link, index) => (
                <span key={index}>
                    {link.url ? (
                        <Link
                            href={link.url}
                            preserveScroll
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm',
                                link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent',
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            className="text-muted-foreground px-3 py-1.5 text-sm"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                </span>
            ))}
        </nav>
    );
}
