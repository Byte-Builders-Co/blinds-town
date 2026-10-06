import { usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { AccountSidebar } from "@/components/account/account-sidebar";

export function AccountLayout({
    stats,
    children,
}: {
    stats: { orders: number; wishlist: number };
    children: ReactNode;
}) {
    const { auth } = usePage().props;
    const isAdminPanelUser = auth.roles.some((role) =>
        ["super-admin", "admin", "staff"].includes(role),
    );

    if (isAdminPanelUser) {
        return (
            <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                {children}
            </div>
        );
    }

    return (
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
            <AccountSidebar
                user={auth.user}
                ordersCount={stats.orders}
                wishlistCount={stats.wishlist}
            />
            <div className="min-w-0 space-y-8">{children}</div>
        </div>
    );
}
