import { Link } from "@inertiajs/react";
import {
    Heart,
    LayoutGrid,
    LogOut,
    MapPin,
    Package,
    User as UserIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { useInitials } from "@/hooks/use-initials";
import { cn, toUrl } from "@/lib/utils";
import { logout } from "@/routes";
import { index as accountIndex } from "@/routes/account";
import { index as addressesIndex } from "@/routes/addresses";
import { index as ordersIndex } from "@/routes/orders";
import { edit as profileEdit } from "@/routes/profile";
import { index as wishlistIndex } from "@/routes/wishlist";
import type { User } from "@/types";

type NavItem = {
    title: string;
    href: ReturnType<typeof accountIndex>;
    icon: LucideIcon;
    count?: number;
};

export function AccountSidebar({
    user,
    ordersCount,
    wishlistCount,
}: {
    user: User;
    ordersCount: number;
    wishlistCount: number;
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const getInitials = useInitials();

    const items: NavItem[] = [
        { title: "Dashboard", href: accountIndex(), icon: LayoutGrid },
        {
            title: "My Orders",
            href: ordersIndex(),
            icon: Package,
            count: ordersCount,
        },
        {
            title: "My Wishlist",
            href: wishlistIndex(),
            icon: Heart,
            count: wishlistCount,
        },
        { title: "Saved Addresses", href: addressesIndex(), icon: MapPin },
        { title: "Profile Settings", href: profileEdit(), icon: UserIcon },
    ];

    return (
        <aside className="h-fit">
            <div className="flex items-center gap-3 px-1 pb-4">
                <Avatar className="size-11 shrink-0">
                    <AvatarImage
                        src={
                            user.profile_image_path
                                ? `/storage/${user.profile_image_path}`
                                : user.avatar
                        }
                        alt={user.name}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-semibold">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                        {user.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                        {user.email}
                    </p>
                </div>
            </div>

            <nav
                aria-label="Account"
                className="flex flex-col gap-0.5 border-t pt-3"
            >
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);

                    return (
                        <Link
                            key={toUrl(item.href)}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "focus-visible:bg-accent/80 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none",
                                active
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
                            )}
                        >
                            <item.icon className="size-4 shrink-0" />
                            <span className="flex-1">{item.title}</span>
                            {item.count !== undefined && (
                                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
                                    {item.count}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-3 border-t pt-3">
                <Link
                    href={logout()}
                    as="button"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none"
                >
                    <LogOut className="size-4" />
                    Sign Out
                </Link>
            </div>
        </aside>
    );
}
