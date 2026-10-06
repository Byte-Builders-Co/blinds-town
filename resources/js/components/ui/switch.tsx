import * as React from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<
    React.ComponentProps<"button">,
    "onChange" | "role" | "type"
> & {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
};

function Switch({
    checked,
    onCheckedChange,
    className,
    ...props
}: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "focus-visible:ring-ring/50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        >
            <span
                className={cn(
                    "bg-background pointer-events-none block size-4 rounded-full shadow-sm transition-transform",
                    checked ? "translate-x-4" : "translate-x-0.5",
                )}
            />
        </button>
    );
}

export { Switch };
