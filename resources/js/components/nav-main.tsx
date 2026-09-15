import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup } from '@/types';

export function NavMain({ groups }: { groups: NavGroup[] }) {
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
        <>
            {groups.map((group) => {
                const open = openGroup === group.label;

                return (
                    <SidebarGroup key={group.label} className="px-2 py-0">
                        <Collapsible open={open}>
                            <CollapsibleTrigger
                                asChild
                                onClick={() => toggle(group.label)}
                            >
                                <SidebarGroupLabel className="flex w-full cursor-pointer items-center justify-between">
                                    {group.label}
                                    <ChevronRight
                                        className={`size-3.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
                                    />
                                </SidebarGroupLabel>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isCurrentUrl(
                                                    item.href,
                                                )}
                                                tooltip={{
                                                    children: item.title,
                                                }}
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
                                </SidebarMenu>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
