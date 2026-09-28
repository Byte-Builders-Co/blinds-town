import { Link, router, usePage } from "@inertiajs/react";
import {
    Heart,
    Package,
    Search,
    ShieldCheck,
    ShoppingCart,
    User,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import AppLogo from "@/components/app-logo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenuContent } from "@/components/user-menu-content";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { home, login } from "@/routes";
import { dashboard as adminDashboard } from "@/routes/admin";
import { show as categoryShow } from "@/routes/categories";
import { index as cartIndex } from "@/routes/cart";
import { index as ordersIndex } from "@/routes/orders";
import { index as productsIndex } from "@/routes/products";
import { index as wishlistIndex } from "@/routes/wishlist";

export function ShopHeader() {
    const { auth, cart, navCategories } = usePage().props;
    const [search, setSearch] = useState("");
    const { isCurrentUrl } = useCurrentUrl();
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
        <header className="border-border/70 sticky top-0 z-40 border-b bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                <Link
                    href={home()}
                    className="flex shrink-0 items-center gap-2"
                >
                    <AppLogo />
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
                    className="border-border relative hidden max-w-56 min-w-0 flex-1 items-center rounded-full border md:flex"
                >
                    <Search className="text-muted-foreground absolute left-3 size-4" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for blinds..."
                        className="w-full rounded-full bg-transparent py-2 pr-3 pl-9 text-sm focus:outline-none"
                    />
                </form>

                <div className="text-foreground ml-auto flex shrink-0 items-center gap-1">
                    {auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="hover:bg-muted rounded-full p-2"
                                    aria-label="Account"
                                    data-test="shop-user-menu"
                                >
                                    <User className="size-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="min-w-56 rounded-lg"
                            >
                                <UserMenuContent
                                    user={auth.user}
                                    extraItems={
                                        <DropdownMenuItem asChild>
                                            <Link
                                                className="block w-full cursor-pointer"
                                                href={ordersIndex()}
                                            >
                                                <Package className="mr-2" />
                                                My Orders
                                            </Link>
                                        </DropdownMenuItem>
                                    }
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            href={login()}
                            aria-label="Sign in"
                            className="hover:bg-muted rounded-full p-2"
                        >
                            <User className="size-5" />
                        </Link>
                    )}

                    {isAdminPanelUser && (
                        <Link
                            href={adminDashboard()}
                            aria-label="Admin"
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
                </div>
            </div>
        </header>
    );
}
