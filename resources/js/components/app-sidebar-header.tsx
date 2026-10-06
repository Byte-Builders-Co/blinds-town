import { usePage } from "@inertiajs/react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types";

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { role } = usePage().props.auth;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <div className="min-w-0 flex-1 [&_ol]:flex-nowrap [&_ol]:overflow-hidden">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            {role && (
                <span className="bg-secondary text-secondary-foreground shrink-0 rounded-full px-3 py-1 text-xs font-medium">
                    {role.panel}
                </span>
            )}
        </header>
    );
}
