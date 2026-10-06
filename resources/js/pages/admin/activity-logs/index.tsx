import { Head, router } from "@inertiajs/react";
import { ScrollText } from "lucide-react";
import { useState } from "react";
import { TableEmptyRow } from "@/components/admin/table-empty-row";
import { PaginationLinks } from "@/components/pagination-links";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { index } from "@/routes/admin/activity-logs";
import type { ActivityLogRow, Paginated } from "@/types";

type Filters = { search?: string; action?: string };

export default function AdminActivityLogsIndex({
    logs,
    filters,
    actions,
}: {
    logs: Paginated<ActivityLogRow>;
    filters: Filters;
    actions: string[];
}) {
    const [search, setSearch] = useState(filters.search ?? "");

    const applyFilters = (patch: Partial<Filters>) => {
        router.get(
            index().url,
            { ...filters, search, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Activity Logs" />

            <div className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Search the log..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") applyFilters({});
                        }}
                        onBlur={() => applyFilters({})}
                        className="max-w-xs"
                    />
                    <Select
                        value={filters.action ?? "all"}
                        onValueChange={(value) =>
                            applyFilters({
                                action: value === "all" ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All actions</SelectItem>
                            {actions.map((action) => (
                                <SelectItem key={action} value={action}>
                                    {action.replace(/_/g, " ")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Open table: no outer box, just hairline dividers. The negative
                    margin lets row hover backgrounds bleed past the text edge so
                    content still lines up with the toolbar above. */}
                <div className="-mx-3 mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b text-xs tracking-wider uppercase">
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    When
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    By
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Action
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3 font-medium"
                                >
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-muted/40 border-border/60 border-b transition-colors"
                                >
                                    <td className="text-muted-foreground px-3 py-3.5 whitespace-nowrap tabular-nums">
                                        {new Date(
                                            log.created_at,
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-3.5 whitespace-nowrap">
                                        {log.causer ?? "System"}
                                    </td>
                                    <td className="px-3 py-3.5 font-medium whitespace-nowrap capitalize">
                                        {log.action.replace(/_/g, " ")}
                                    </td>
                                    <td className="text-muted-foreground px-3 py-3.5">
                                        {log.description}
                                    </td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && (
                                <TableEmptyRow
                                    colSpan={4}
                                    icon={ScrollText}
                                    title="Nothing has been logged yet"
                                    description="Activity will show up here as it happens."
                                />
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <PaginationLinks paginated={logs} label="entries" />
                </div>
            </div>
        </>
    );
}

AdminActivityLogsIndex.layout = {
    breadcrumbs: [{ title: "Activity Logs", href: index() }],
};
