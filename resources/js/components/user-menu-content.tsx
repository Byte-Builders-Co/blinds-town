import { Link, router, usePage } from "@inertiajs/react";
import { LogOut, Settings } from "lucide-react";
import type { ReactNode } from "react";
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { logout } from "@/routes";
import { edit } from "@/routes/appearance";
import type { User } from "@/types";

type Props = {
    user: User;
    extraItems?: ReactNode;
};

export function UserMenuContent({ user, extraItems }: Props) {
    const { role } = usePage().props.auth;
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const itemClass = "gap-2.5 rounded-md px-2.5 py-2";
    const linkClass = "flex w-full cursor-pointer items-center gap-2.5";

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2.5 py-2.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} role={role?.label} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-0 my-1.5" />
            {extraItems && <DropdownMenuGroup>{extraItems}</DropdownMenuGroup>}
            <DropdownMenuGroup>
                <DropdownMenuItem asChild className={itemClass}>
                    <Link
                        className={linkClass}
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-0 my-1.5" />
            <DropdownMenuItem
                asChild
                className={`${itemClass} text-destructive focus:bg-destructive/10 focus:text-destructive dark:text-red-400 dark:focus:text-red-300 [&_svg]:text-current!`}
            >
                <Link
                    className={linkClass}
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
