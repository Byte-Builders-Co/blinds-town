import { Link, usePage } from "@inertiajs/react";
import { Palette, ShieldCheck } from "lucide-react";
import type { PropsWithChildren } from "react";
import Heading from "@/components/heading";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { cn, toUrl } from "@/lib/utils";
import { edit as editAppearance } from "@/routes/appearance";
import { edit as editSecurity } from "@/routes/security";
import type { NavItem } from "@/types";

const sidebarNavItems: NavItem[] = [
    {
        title: "Appearance",
        href: editAppearance(),
        icon: Palette,
    },
    {
        title: "Security",
        href: editSecurity(),
        icon: ShieldCheck,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage().props;
    const navItems = auth.user
        ? sidebarNavItems
        : sidebarNavItems.filter((item) => item.title === "Appearance");

    return (
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                <aside className="w-full lg:w-56 lg:shrink-0">
                    <nav
                        className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
                        aria-label="Settings"
                    >
                        {navItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:bg-accent/80 lg:w-full",
                                        active
                                            ? "bg-accent text-foreground"
                                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className={cn("size-4", active && "text-primary")} />
                                    )}
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="min-w-0 flex-1">
                    <section className="space-y-10 [&>*+*]:border-t [&>*+*]:pt-10 [&>.sr-only+*]:mt-0! [&>.sr-only+*]:border-t-0! [&>.sr-only+*]:pt-0!">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
