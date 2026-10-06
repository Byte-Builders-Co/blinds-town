import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DashboardRange, DashboardRangeKey } from "@/types";

export type PeriodChange =
    | { key: Exclude<DashboardRangeKey, "custom"> }
    | { key: "custom"; from: string; to: string };

const PRESETS: { key: DashboardRangeKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "7d", label: "7 Days" },
    { key: "30d", label: "30 Days" },
    { key: "3m", label: "3 Months" },
    { key: "12m", label: "12 Months" },
    { key: "custom", label: "Custom Range" },
];

/**
 * The single filter row that scopes every figure on the dashboard. Presets
 * come first; a custom range opens two date fields inline.
 */
export function PeriodFilter({
    range,
    pendingKey,
    onChange,
}: {
    range: DashboardRange;
    /** The preset being loaded, so the control responds before the data arrives. */
    pendingKey?: DashboardRangeKey | null;
    onChange: (change: PeriodChange) => void;
}) {
    const [customOpen, setCustomOpen] = useState(range.key === "custom");
    const [from, setFrom] = useState(range.from);
    const [to, setTo] = useState(range.to);

    const selected = customOpen ? "custom" : (pendingKey ?? range.key);
    const canApply = from !== "" && to !== "" && from <= to;

    const select = (key: string) => {
        // Radix reports "" when the active item is clicked again; ignore it.
        if (key === "") {
            return;
        }

        if (key === "custom") {
            // Start from whatever range is currently on screen.
            setFrom(range.from);
            setTo(range.to);
            setCustomOpen(true);

            return;
        }

        setCustomOpen(false);
        onChange({ key: key as Exclude<DashboardRangeKey, "custom"> });
    };

    return (
        <div className="flex min-w-0 flex-col gap-3 sm:items-end">
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <ToggleGroup
                    type="single"
                    value={selected}
                    onValueChange={select}
                    aria-label="Dashboard period"
                    className="bg-muted/60 h-10 w-max gap-0.5 rounded-lg border p-1"
                >
                    {PRESETS.map((preset) => (
                        <ToggleGroupItem
                            key={preset.key}
                            value={preset.key}
                            className="text-muted-foreground hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground h-8 rounded-md px-3 text-[13px] font-medium hover:bg-transparent data-[state=on]:shadow-xs"
                        >
                            {preset.key === "custom" && (
                                <CalendarRange
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                            )}
                            {preset.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            {customOpen && (
                <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (canApply) {
                            onChange({ key: "custom", from, to });
                        }
                    }}
                >
                    <label className="sr-only" htmlFor="dashboard-from">
                        From date
                    </label>
                    <Input
                        id="dashboard-from"
                        type="date"
                        value={from}
                        max={to || undefined}
                        onChange={(event) => setFrom(event.target.value)}
                        className="h-9 w-40"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <label className="sr-only" htmlFor="dashboard-to">
                        To date
                    </label>
                    <Input
                        id="dashboard-to"
                        type="date"
                        value={to}
                        min={from || undefined}
                        onChange={(event) => setTo(event.target.value)}
                        className="h-9 w-40"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="h-9"
                        disabled={!canApply}
                    >
                        Apply
                    </Button>
                </form>
            )}
        </div>
    );
}
