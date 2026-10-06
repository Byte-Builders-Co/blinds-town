/**
 * Soft status tints for delta chips. Each is always paired with an arrow and
 * a signed value, never colour alone.
 */
export type Tone = "positive" | "negative" | "neutral";

export const TONE_STYLES: Record<Tone, { chip: string }> = {
    positive: {
        chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    negative: {
        chip: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
    neutral: {
        chip: "bg-muted text-muted-foreground",
    },
};
