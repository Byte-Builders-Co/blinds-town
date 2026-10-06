import type { LucideIcon } from "lucide-react";
import { Monitor, Moon, Sun } from "lucide-react";
import type { HTMLAttributes } from "react";
import type { Appearance } from "@/hooks/use-appearance";
import { useAppearance } from "@/hooks/use-appearance";
import { cn } from "@/lib/utils";

export default function AppearanceToggleTab({
    className = "",
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: "light", icon: Sun, label: "Light" },
        { value: "dark", icon: Moon, label: "Dark" },
        { value: "system", icon: Monitor, label: "System" },
    ];

    return (
        <div
            className={cn(
                "inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-muted",
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        "flex items-center rounded-md px-3.5 py-1.5 transition-colors",
                        appearance === value
                            ? "bg-white shadow-xs dark:bg-accent dark:text-foreground"
                            : "text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-muted-foreground dark:hover:bg-accent/60 dark:hover:text-foreground",
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
