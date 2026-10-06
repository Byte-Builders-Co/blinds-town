import { Link, router, usePage } from "@inertiajs/react";
import {
    Heart,
    LayoutDashboard,
    LogIn,
    Package,
    Search,
    ShieldCheck,
    Settings,
    ShoppingCart,
    User,
    UserPlus,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import AppLogo from "@/components/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenuContent } from "@/components/user-menu-content";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { home, login, register } from "@/routes";
import { edit as appearanceEdit } from "@/routes/appearance";
import { dashboard as adminDashboard } from "@/routes/admin";
import { show as categoryShow } from "@/routes/categories";
import { index as cartIndex } from "@/routes/cart";
import { index as accountIndex } from "@/routes/account";
import { index as productsIndex } from "@/routes/products";
import { index as wishlistIndex } from "@/routes/wishlist";
import { index as ordersIndex } from "@/routes/orders";

export function ShopHeader() {
    const { auth, cart, navCategories } = usePage().props;
    const [search, setSearch] = useState("");
    const { isCurrentUrl } = useCurrentUrl();
    const getInitials = useInitials();
    const isAdminPanelUser = auth.roles.some((role) =>
        ["super-admin", "admin", "staff"].includes(role),
    );

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(productsIndex().url, { search: search || undefined });
    };

    const navLinks = [
        { title: "Home", href: home() },
        ...navCategories.map((category) => ({
            title: category.name,
            href: categoryShow(category.slug ?? ""),
        })),
    ];

    return (
        <header className="border-border/70 bg-background/90 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                <Link
                    href={home()}
                    className="flex shrink-0 items-center gap-2"
                >
                    <span className="rounded-md dark:bg-white dark:px-1.5 dark:py-0.5">
                        <AppLogo />
                    </span>
                    <span className="text-muted-foreground hidden text-[11px] leading-tight sm:block">
                        Better Windows.
                        <br />
                        Better Living.
                    </span>
                </Link>

                <nav className="hidden min-w-0 flex-1 scrollbar-none items-center gap-4 overflow-x-auto text-sm font-medium lg:flex xl:justify-center xl:gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className={`shrink-0 border-b-2 pb-1 whitespace-nowrap transition-colors ${
                                isCurrentUrl(link.href)
                                    ? "border-primary text-primary"
                                    : "text-foreground/80 hover:text-primary border-transparent"
                            }`}
                        >
                            {link.title}
                        </Link>
                    ))}
                </nav>

                <form
                    onSubmit={submitSearch}
                    className="border-border bg-muted/40 relative hidden max-w-56 min-w-0 flex-1 items-center rounded-full border md:flex"
                >
                    <Search className="text-muted-foreground absolute left-3 size-4" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for blinds..."
                        className="text-foreground placeholder:text-muted-foreground w-full rounded-full bg-transparent py-2 pr-3 pl-9 text-sm focus:outline-none"
                    />
                </form>

                <div className="text-foreground ml-auto flex shrink-0 items-center gap-1">
                    {isAdminPanelUser && (
                        <Link
                            href={adminDashboard()}
                            aria-label={auth.role?.panel ?? "Admin Panel"}
                            title={auth.role?.panel ?? "Admin Panel"}
                            className="hover:bg-muted rounded-full p-2"
                        >
                            <ShieldCheck className="size-5" />
                        </Link>
                    )}

                    <Link
                        href={wishlistIndex()}
                        aria-label="Wishlist"
                        className="hover:bg-muted rounded-full p-2"
                    >
                        <Heart className="size-5" />
                    </Link>

                    <Link
                        href={cartIndex()}
                        aria-label="Cart"
                        className="hover:bg-muted relative rounded-full p-2"
                    >
                        <ShoppingCart className="size-5" />
                        {cart.count > 0 && (
                            <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                                {cart.count}
                            </span>
                        )}
                    </Link>

                    {auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="hover:bg-muted focus-visible:bg-muted ml-1 flex items-center gap-2.5 rounded-full py-1 pr-1 pl-1 outline-none xl:pr-3"
                                    aria-label="Account"
                                    data-test="shop-user-menu"
                                >
                                    <Avatar className="size-8">
                                        <AvatarImage
                                            src={
                                                auth.user.profile_image_path
                                                    ? `/storage/${auth.user.profile_image_path}`
                                                    : auth.user.avatar
                                            }
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-foreground/90 hidden max-w-32 truncate text-sm font-medium xl:block">
                                        {auth.user.name}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-64 rounded-xl p-1.5"
                            >
                                <UserMenuContent
                                    user={auth.user}
                                    extraItems={
                                        <>
                                            <DropdownMenuItem
                                                asChild
                                                className="gap-2.5 rounded-md px-2.5 py-2"
                                            >
                                                <Link
                                                    className="flex w-full cursor-pointer items-center gap-2.5"
                                                    href={accountIndex()}
                                                >
                                                    <LayoutDashboard />
                                                    My Account
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                asChild
                                                className="gap-2.5 rounded-md px-2.5 py-2"
                                            >
                                                <Link
                                                    className="flex w-full cursor-pointer items-center gap-2.5"
                                                    href={ordersIndex()}
                                                >
                                                    <Package />
                                                    My Orders
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    }
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="hover:bg-muted focus-visible:bg-muted rounded-full p-2 outline-none"
                                    aria-label="Account"
                                    data-test="shop-guest-menu"
                                >
                                    <User className="size-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-xl p-1.5"
                            >
                                <DropdownMenuItem
                                    asChild
                                    className="gap-2.5 rounded-md px-2.5 py-2"
                                >
                                    <Link
                                        className="flex w-full cursor-pointer items-center gap-2.5"
                                        href={login()}
                                    >
                                        <LogIn />
                                        Log in
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    className="gap-2.5 rounded-md px-2.5 py-2"
                                >
                                    <Link
                                        className="flex w-full cursor-pointer items-center gap-2.5"
                                        href={register()}
                                    >
                                        <UserPlus />
                                        Create account
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="mx-0 my-1.5" />
                                <DropdownMenuItem
                                    asChild
                                    className="gap-2.5 rounded-md px-2.5 py-2"
                                >
                                    <Link
                                        className="flex w-full cursor-pointer items-center gap-2.5"
                                        href={appearanceEdit()}
                                    >
                                        <Settings />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
