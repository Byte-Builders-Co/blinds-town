import { Link, usePage } from "@inertiajs/react";
import {
    BarChart3,
    CircleHelp,
    LayoutDashboard,
    FileText,
    Mail,
    Megaphone,
    Package,
    ReceiptText,
    ScrollText,
    Settings as SettingsIcon,
    SlidersHorizontal,
    Star,
    Store,
    Tag,
    Ticket,
    UserCog,
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
import { index as adminActivityLogsIndex } from "@/routes/admin/activity-logs";
import { index as adminCategoriesIndex } from "@/routes/admin/categories";
import { index as adminUsersIndex } from "@/routes/admin/users";
import { index as adminCmsPagesIndex } from "@/routes/admin/cms-pages";
import { index as adminFaqsIndex } from "@/routes/admin/faqs";
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
    const can = (permission: string) => permissions.includes(permission);

    // Each entry shows only if the signed-in user holds its permission. This
    // is only a convenience: the server enforces the same permissions on every
    // route, so typing a URL by hand is refused too.
    const candidates: (NavItem & { permission: string })[] = [
        {
            title: "Dashboard",
            href: adminDashboard(),
            icon: LayoutDashboard,
            permission: "dashboard.view",
        },
        {
            title: "Products",
            href: adminProductsIndex(),
            icon: Package,
            permission: "products.view",
        },
        {
            title: "Orders",
            href: adminOrdersIndex(),
            icon: ReceiptText,
            permission: "orders.view",
        },
        {
            title: "Categories",
            href: adminCategoriesIndex(),
            icon: Tag,
            permission: "categories.view",
        },
        {
            title: "Customer",
            href: adminCustomersIndex(),
            icon: Users,
            permission: "users.view",
        },
        {
            title: "Users",
            href: adminUsersIndex(),
            icon: UserCog,
            permission: "users.view",
        },
        {
            title: "Reports",
            href: adminReportsIndex(),
            icon: BarChart3,
            permission: "reports.view",
        },
        {
            title: "Activity Logs",
            href: adminActivityLogsIndex(),
            icon: ScrollText,
            permission: "activity_logs.view",
        },
    ];

    return candidates
        .filter((item) => can(item.permission))
        .map((item) => ({
            title: item.title,
            href: item.href,
            icon: item.icon,
        }));
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

    // Content (pages and FAQs) and Settings are separate permissions, so a
    // person can be given one without the other.
    const systemCandidates: (NavItem & { permission: string })[] = [
        {
            title: "Website Configuration",
            href: adminSettingsEdit("store"),
            icon: Store,
            permission: "settings.view",
        },
        {
            title: "Email Notifications",
            href: adminSettingsEdit("notifications"),
            icon: Mail,
            permission: "settings.view",
        },
        {
            title: "Content Pages",
            href: adminCmsPagesIndex(),
            icon: FileText,
            permission: "cms.view",
        },
        {
            title: "FAQs",
            href: adminFaqsIndex(),
            icon: CircleHelp,
            permission: "cms.view",
        },
        {
            title: "Basic Store Settings",
            href: adminSettingsEdit("business"),
            icon: SlidersHorizontal,
            permission: "settings.view",
        },
    ];

    const systemItems: NavItem[] = systemCandidates
        .filter((item) => permissions.includes(item.permission))
        .map((item) => ({
            title: item.title,
            href: item.href,
            icon: item.icon,
        }));

    if (systemItems.length > 0) {
        groups.push({
            label: "System Settings",
            icon: SettingsIcon,
            items: systemItems,
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
        <Sidebar collapsible="icon" variant="sidebar">
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
