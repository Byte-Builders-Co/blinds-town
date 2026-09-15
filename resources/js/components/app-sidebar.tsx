import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Package,
    ReceiptText,
    Settings as SettingsIcon,
    ShieldCheck,
    Star,
    Store,
    Tag,
    Ticket,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminCategoriesIndex } from '@/routes/admin/categories';
import { index as adminCouponsIndex } from '@/routes/admin/coupons';
import { index as adminCustomersIndex } from '@/routes/admin/customers';
import { index as adminOrdersIndex } from '@/routes/admin/orders';
import { index as adminProductsIndex } from '@/routes/admin/products';
import { index as adminReportsIndex } from '@/routes/admin/reports';
import { index as adminReviewsIndex } from '@/routes/admin/reviews';
import { edit as adminSettingsEdit } from '@/routes/admin/settings';
import type { NavGroup, NavItem } from '@/types';

/**
 * The admin panel is scoped to exactly 9 modules: Dashboard, Product
 * Management, Category Management, Order Management, Customer Management,
 * Offer & Discount Management, Product Reviews, Reports, and System
 * Settings. Nothing else is added here.
 */
function buildAdminNavGroups(permissions: string[]): NavGroup[] {
    const groups: NavGroup[] = [
        {
            label: 'Overview',
            items: [
                {
                    title: 'Dashboard',
                    href: adminDashboard(),
                    icon: ShieldCheck,
                },
            ],
        },
        {
            label: 'Catalog',
            items: [
                {
                    title: 'Product Management',
                    href: adminProductsIndex(),
                    icon: Package,
                },
                {
                    title: 'Category Management',
                    href: adminCategoriesIndex(),
                    icon: Tag,
                },
            ],
        },
        {
            label: 'Sales',
            items: [
                {
                    title: 'Order Management',
                    href: adminOrdersIndex(),
                    icon: ReceiptText,
                },
                {
                    title: 'Customer Management',
                    href: adminCustomersIndex(),
                    icon: Users,
                },
            ],
        },
    ];

    const marketingItems: NavItem[] = [];

    if (permissions.includes('coupons.view')) {
        marketingItems.push({
            title: 'Offer & Discount Management',
            href: adminCouponsIndex(),
            icon: Ticket,
        });
    }

    if (permissions.includes('reviews.view')) {
        marketingItems.push({
            title: 'Product Reviews',
            href: adminReviewsIndex(),
            icon: Star,
        });
    }

    if (marketingItems.length > 0) {
        groups.push({ label: 'Marketing', items: marketingItems });
    }

    if (permissions.includes('reports.view')) {
        groups.push({
            label: 'Reports',
            items: [
                {
                    title: 'Reports',
                    href: adminReportsIndex(),
                    icon: BarChart3,
                },
            ],
        });
    }

    if (permissions.includes('settings.view')) {
        groups.push({
            label: 'System Settings',
            items: [
                {
                    title: 'Website Configuration',
                    href: adminSettingsEdit('store'),
                    icon: Store,
                },
                {
                    title: 'Basic Store Settings',
                    href: adminSettingsEdit('business'),
                    icon: SettingsIcon,
                },
                {
                    title: 'Email Notifications',
                    href: adminSettingsEdit('notifications'),
                    icon: SettingsIcon,
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
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
