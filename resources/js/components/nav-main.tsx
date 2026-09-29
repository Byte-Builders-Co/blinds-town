import { Link } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useCurrentUrl } from "@/hooks/use-current-url";
import type { NavGroup, NavItem } from "@/types";

export function NavMain({
    items = [],
    groups,
}: {
    items?: NavItem[];
    groups: NavGroup[];
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        const activeGroup = groups.find((group) =>
            group.items.some((item) => isCurrentUrl(item.href)),
        );

        return (activeGroup ?? groups[0])?.label ?? null;
    });

    const toggle = (label: string) => {
        setOpenGroup((prev) => (prev === label ? null : label));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {!!item.badge && (
                                    <Badge
                                        variant="destructive"
                                        className="ml-auto"
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}

                {groups.map((group) => {
                    const open = openGroup === group.label;

                    return (
                        <Collapsible key={group.label} open={open} asChild>
                            <SidebarMenuItem>
                                <CollapsibleTrigger
                                    asChild
                                    onClick={() => toggle(group.label)}
                                >
                                    <SidebarMenuButton
                                        tooltip={{ children: group.label }}
                                    >
                                        {group.icon && <group.icon />}
                                        <span>{group.label}</span>
                                        <ChevronRight
                                            className={`ml-auto size-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {group.items.map((item) => (
                                            <SidebarMenuSubItem
                                                key={item.title}
                                            >
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={isCurrentUrl(
                                                        item.href,
                                                    )}
                                                >
                                                    <Link
                                                        href={item.href}
                                                        prefetch
                                                    >
                                                        {item.icon && (
                                                            <item.icon />
                                                        )}
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                        {!!item.badge && (
                                                            <Badge
                                                                variant="destructive"
                                                                className="ml-auto"
                                                            >
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
