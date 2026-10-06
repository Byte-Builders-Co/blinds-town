import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardFormat } from "./dashboard-format";
import { TONE_STYLES } from "./tones";
import type { Tone } from "./tones";

type Props = {
    /** Percentage change, or null when the previous period had nothing to compare. */
    change: number | null;
    /** Whether there is any current activity (distinguishes "New" from "—"). */
    hasValue?: boolean;
    className?: string;
};

/**
 * A signed change chip. Direction is shown by an arrow and the sign as well
 * as colour, so it never relies on colour alone. Every dashboard metric is
 * "up is good".
 */
export function DeltaBadge({ change, hasValue = true, className }: Props) {
    const { percent } = useDashboardFormat();

    let tone: Tone = "neutral";
    let Icon = Minus;
    let text = "—";

    if (change === null) {
        text = hasValue ? "New" : "—";
    } else if (change > 0) {
        tone = "positive";
        Icon = ArrowUpRight;
        text = percent(change);
    } else if (change < 0) {
        tone = "negative";
        Icon = ArrowDownRight;
        text = percent(change);
    } else {
        text = "0.0%";
    }

    return (
        <span
            className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                TONE_STYLES[tone].chip,
                className,
            )}
        >
            <Icon className="size-3" aria-hidden="true" />
            {text}
        </span>
    );
}
