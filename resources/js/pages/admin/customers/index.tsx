import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index, show } from '@/routes/admin/customers';
import { USER_STATUS_LABELS } from '@/types/auth';
import type { Paginated, User, UserStatus } from '@/types';

type Filters = { search?: string; status?: string };

const statusVariant: Record<
    UserStatus,
    'default' | 'secondary' | 'destructive'
> = {
    active: 'default',
    inactive: 'secondary',
    blocked: 'destructive',
};

export default function AdminCustomersIndex({
    customers,
    filters,
    statuses,
}: {
    customers: Paginated<User>;
    filters: Filters;
    statuses: UserStatus[];
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (patch: Partial<Filters>) => {
        router.get(
            index().url,
            { ...filters, search, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Customers" />

            <div className="p-4">
                <h1 className="text-2xl font-semibold">Customers</h1>

                <div className="mt-4 flex flex-wrap gap-3">
                    <Input
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') applyFilters({});
                        }}
                        onBlur={() => applyFilters({})}
                        className="max-w-xs"
                    />
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                status: value === 'all' ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {USER_STATUS_LABELS[status]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="mt-6 divide-y rounded-lg border">
                    {customers.data.map((customer) => (
                        <Link
                            key={customer.id}
                            href={show(customer)}
                            className="hover:bg-accent flex items-center justify-between px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-muted-foreground text-sm">
                                    {customer.email}
                                </p>
                            </div>
                            <Badge variant={statusVariant[customer.status]}>
                                {USER_STATUS_LABELS[customer.status]}
                            </Badge>
                        </Link>
                    ))}
                </div>

                <div className="mt-6">
                    <PaginationLinks paginated={customers} />
                </div>
            </div>
        </>
    );
}

AdminCustomersIndex.layout = {
    breadcrumbs: [{ title: 'Customers', href: index() }],
};
