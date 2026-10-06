import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import type { User } from "@/types";

export function UserInfo({
    user,
    showEmail = false,
    role,
}: {
    user: User;
    showEmail?: boolean;
    /** The user's role label (e.g. "Super Admin"), shown under their name. */
    role?: string;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="size-9 overflow-hidden rounded-full">
                <AvatarImage
                    src={
                        user.profile_image_path
                            ? `/storage/${user.profile_image_path}`
                            : user.avatar
                    }
                    alt={user.name}
                />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {role && (
                    <span className="text-muted-foreground truncate text-xs">
                        {role}
                    </span>
                )}
                {showEmail && (
                    <span className="text-muted-foreground truncate text-xs">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
