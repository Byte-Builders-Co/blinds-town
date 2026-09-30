import { Link, usePage } from "@inertiajs/react";
import {
    BarChart3,
    LayoutDashboard,
    Mail,
    Megaphone,
    Package,
    ReceiptText,
    Settings as SettingsIcon,
    SlidersHorizontal,
    Star,
    Store,
    Tag,
    Ticket,
    Users,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard as adminDashboard } from "@/routes/admin";
import { index as adminCategoriesIndex } from "@/routes/admin/categories";
import { index as adminCouponsIndex } from "@/routes/admin/coupons";
import { index as adminCustomersIndex } from "@/routes/admin/customers";
import { index as adminOrdersIndex } from "@/routes/admin/orders";
import { index as adminProductsIndex } from "@/routes/admin/products";
import { index as adminReportsIndex } from "@/routes/admin/reports";
import { index as adminReviewsIndex } from "@/routes/admin/reviews";
import { edit as adminSettingsEdit } from "@/routes/admin/settings";
import type { NavGroup, NavItem } from "@/types";

/**
 * Flat, top-level sidebar links that are always visible without needing to
 * expand a submenu: Dashboard, Product Management, Category Management,
 * Order Management, Customer Management, and (permission-gated) Reports.
 */
function buildAdminNavItems(permissions: string[]): NavItem[] {
    const items: NavItem[] = [
        {
            title: "Dashboard",
            href: adminDashboard(),
            icon: LayoutDashboard,
        },
        {
            title: "Products",
            href: adminProductsIndex(),
            icon: Package,
        },
        {
            title: "Orders",
            href: adminOrdersIndex(),
            icon: ReceiptText,
        },
        {
            title: "Categories",
            href: adminCategoriesIndex(),
            icon: Tag,
        },

        {
            title: "Customer",
            href: adminCustomersIndex(),
            icon: Users,
        },
    ];

    if (permissions.includes("reports.view")) {
        items.push({
            title: "Reports",
            href: adminReportsIndex(),
            icon: BarChart3,
        });
    }

    return items;
}

function buildAdminNavGroups(permissions: string[]): NavGroup[] {
    const groups: NavGroup[] = [];

    const marketingItems: NavItem[] = [];

    if (permissions.includes("coupons.view")) {
        marketingItems.push({
            title: "Offer & Discount",
            href: adminCouponsIndex(),
            icon: Ticket,
        });
    }

    if (permissions.includes("reviews.view")) {
        marketingItems.push({
            title: "Product Reviews",
            href: adminReviewsIndex(),
            icon: Star,
        });
    }

    if (marketingItems.length > 0) {
        groups.push({
            label: "Marketing",
            icon: Megaphone,
            items: marketingItems,
        });
    }

    if (permissions.includes("settings.view")) {
        groups.push({
            label: "System Settings",
            icon: SettingsIcon,
            items: [
                {
                    title: "Website Configuration",
                    href: adminSettingsEdit("store"),
                    icon: Store,
                },
                {
                    title: "Email Notifications",
                    href: adminSettingsEdit("notifications"),
                    icon: Mail,
                },
                {
                    title: "Basic Store Settings",
                    href: adminSettingsEdit("business"),
                    icon: SlidersHorizontal,
                },
            ],
        });
    }

    return groups;
}

/**
 * Renders the admin-panel navigation rail. Only ever used inside the admin
 * layout — customers get {@link ShopHeader} instead, never this sidebar.
 */
export function AppSidebar() {
    const { auth } = usePage().props;
    const navItems = buildAdminNavItems(auth.permissions);
    const navGroups = buildAdminNavGroups(auth.permissions);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={adminDashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
