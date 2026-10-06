import { useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useElementSize } from "@/hooks/use-element-size";
import { cn } from "@/lib/utils";

export type SalesChartPoint = {
    title: string;
    revenue: number;
    orders: number;
};

type Props = {
    points: SalesChartPoint[];
    formatRevenue: (value: number) => string;
    formatRevenueTick: (value: number) => string;
    formatOrders: (value: number) => string;
    emptyLabel?: string;
    height?: number;
    className?: string;
};

const MARGIN = { top: 14, right: 20, bottom: 44 };
const TICK_COUNT = 4;
const CHAR_WIDTH = 6.4;
const HIT_RADIUS = 28;

/** Round the axis up to a clean step (1, 2, 2.5, 5 × 10ⁿ). */
function niceScale(peak: number) {
    const rawStep = Math.max(peak, 1) / TICK_COUNT;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const residual = rawStep / magnitude;
    const factor =
        residual <= 1
            ? 1
            : residual <= 2
              ? 2
              : residual <= 2.5
                ? 2.5
                : residual <= 5
                  ? 5
                  : 10;
    const step = factor * magnitude;

    return { step, intervals: Math.max(1, Math.ceil(peak / step)) };
}

/**
 * Revenue against the number of orders as a running total: the x-axis counts
 * orders so far and the y-axis the revenue they brought in, so the chart ends
 * exactly on the period totals shown above it. Each dot is a period that had orders.
 */
export function SalesChart({
    points,
    formatRevenue,
    formatRevenueTick,
    formatOrders,
    emptyLabel = "No sales in this period",
    height = 320,
    className,
}: Props) {
    const [containerRef, { width }] = useElementSize<HTMLDivElement>();
    const [active, setActive] = useState<number | null>(null);

    // Running totals: each period that had orders moves the chart to the right
    // (more orders) and up (more revenue), starting from zero.
    const running = points.reduce<
        {
            title: string;
            orders: number;
            revenue: number;
            periodOrders: number;
            periodRevenue: number;
        }[]
    >((steps, point) => {
        if (point.orders === 0) {
            return steps;
        }

        const last = steps[steps.length - 1];

        return [
            ...steps,
            {
                title: point.title,
                orders: (last?.orders ?? 0) + point.orders,
                revenue: (last?.revenue ?? 0) + point.revenue,
                periodOrders: point.orders,
                periodRevenue: point.revenue,
            },
        ];
    }, []);
    const sorted = running;
    const count = sorted.length;

    const peakRevenue = running[count - 1]?.revenue ?? 0;
    const peakOrders = running[count - 1]?.orders ?? 0;

    const revenueScale = niceScale(peakRevenue);
    const revenueMax = revenueScale.step * revenueScale.intervals;
    const revenueTicks = Array.from(
        { length: revenueScale.intervals + 1 },
        (_, i) => i * revenueScale.step,
    );
    const revenueLabels = revenueTicks.map(formatRevenueTick);

    const left =
        Math.ceil(
            Math.max(...revenueLabels.map((label) => label.length)) *
                CHAR_WIDTH,
        ) + 14;
    const innerWidth = Math.max(0, width - left - MARGIN.right);
    const innerHeight = height - MARGIN.top - MARGIN.bottom;
    const baseline = MARGIN.top + innerHeight;

    // Whole-number order ticks, thinned so labels never collide.
    const xMax = Math.max(1, peakOrders);
    const tickStride = Math.max(
        1,
        Math.ceil(xMax / Math.max(2, Math.floor(innerWidth / 48))),
    );
    const orderTicks = Array.from(
        { length: Math.floor(xMax / tickStride) + 1 },
        (_, i) => i * tickStride,
    );

    const x = (orders: number) =>
        left + 12 + (orders / xMax) * (innerWidth - 24);
    const y = (revenue: number) =>
        baseline - (revenue / revenueMax) * innerHeight;

    const averageLine = [{ orders: 0, revenue: 0 }, ...running]
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"}${x(point.orders).toFixed(1)},${y(point.revenue).toFixed(1)}`,
        )
        .join("");

    const handlePointer = (event: PointerEvent<SVGRectElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = event.clientX - rect.left + left;
        const py = event.clientY - rect.top + MARGIN.top;

        let nearest: number | null = null;
        let best = HIT_RADIUS;

        sorted.forEach((point, index) => {
            const distance = Math.hypot(
                x(point.orders) - px,
                y(point.revenue) - py,
            );

            if (distance <= best) {
                best = distance;
                nearest = index;
            }
        });

        setActive(nearest);
    };

    const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
        const move = (index: number) => {
            event.preventDefault();
            setActive(Math.min(count - 1, Math.max(0, index)));
        };

        if (event.key === "ArrowRight") move((active ?? -1) + 1);
        else if (event.key === "ArrowLeft") move((active ?? count) - 1);
        else if (event.key === "Home") move(0);
        else if (event.key === "End") move(count - 1);
        else if (event.key === "Escape") setActive(null);
    };

    const activePoint = active === null ? null : sorted[active];
    const tooltipOnRight =
        activePoint !== null && x(activePoint.orders) < width * 0.6;
    const empty = peakRevenue === 0 && peakOrders === 0;

    return (
        <div
            ref={containerRef}
            className={cn(
                "focus-visible:ring-ring/50 relative rounded-md outline-none focus-visible:ring-2",
                className,
            )}
            style={{ height }}
            tabIndex={0}
            role="group"
            aria-label={`Running total of revenue by number of orders, ${count} data points. Use the left and right arrow keys to read each point.`}
            onKeyDown={handleKey}
            onFocus={() => setActive((current) => current ?? 0)}
            onBlur={() => setActive(null)}
        >
            {width > 0 && (
                <svg
                    width={width}
                    height={height}
                    className="block"
                    aria-hidden="true"
                >
                    {revenueTicks.map((tick, i) => (
                        <g key={tick}>
                            <line
                                x1={left}
                                x2={left + innerWidth}
                                y1={y(tick)}
                                y2={y(tick)}
                                strokeWidth={1}
                                className={
                                    i === 0
                                        ? "stroke-foreground/15"
                                        : "stroke-border"
                                }
                            />
                            <text
                                x={left - 10}
                                y={y(tick)}
                                textAnchor="end"
                                dominantBaseline="middle"
                                className="fill-muted-foreground text-[11px] tabular-nums"
                            >
                                {revenueLabels[i]}
                            </text>
                        </g>
                    ))}

                    {orderTicks.map((tick) => (
                        <text
                            key={tick}
                            x={x(tick)}
                            y={baseline + 16}
                            textAnchor="middle"
                            className="fill-muted-foreground text-[11px] tabular-nums"
                        >
                            {tick}
                        </text>
                    ))}
                    <text
                        x={left + innerWidth / 2}
                        y={height - 6}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[11px] font-medium"
                    >
                        Number of orders
                    </text>

                    {count > 0 && (
                        <path
                            d={averageLine}
                            fill="none"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="stroke-chart-1"
                        />
                    )}

                    {sorted.map((point, index) => (
                        <circle
                            key={`${point.title}-${index}`}
                            cx={x(point.orders)}
                            cy={y(point.revenue)}
                            r={active === index ? 6 : 4.5}
                            strokeWidth={2}
                            className={cn(
                                "fill-chart-1 stroke-card transition-[r]",
                                active !== null &&
                                    active !== index &&
                                    "opacity-50",
                            )}
                        />
                    ))}

                    <rect
                        x={left}
                        y={MARGIN.top}
                        width={innerWidth}
                        height={innerHeight}
                        fill="transparent"
                        style={{ touchAction: "pan-y" }}
                        onPointerDown={handlePointer}
                        onPointerMove={handlePointer}
                        onPointerLeave={() => setActive(null)}
                    />
                </svg>
            )}

            {empty && width > 0 && (
                <p className="text-muted-foreground pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm">
                    {emptyLabel}
                </p>
            )}

            {activePoint && (
                <div
                    role="status"
                    className="bg-popover text-popover-foreground pointer-events-none absolute z-10 min-w-44 rounded-lg border px-3 py-2.5 text-xs shadow-md"
                    style={{
                        top: Math.max(0, y(activePoint.revenue) - 28),
                        left: tooltipOnRight
                            ? x(activePoint.orders) + 14
                            : x(activePoint.orders) - 14,
                        transform: tooltipOnRight
                            ? undefined
                            : "translateX(-100%)",
                    }}
                >
                    <p className="text-muted-foreground">{activePoint.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="bg-chart-1 size-2 shrink-0 rounded-full" />
                        <span className="text-foreground text-sm font-semibold tabular-nums">
                            {formatRevenue(activePoint.revenue)}
                        </span>
                        <span className="text-muted-foreground">
                            Revenue so far
                        </span>
                    </div>
                    <p className="text-muted-foreground mt-1.5">
                        <span className="text-foreground font-semibold tabular-nums">
                            {formatOrders(activePoint.orders)}
                        </span>{" "}
                        {activePoint.orders === 1 ? "order" : "orders"} so far
                    </p>
                    <p className="text-muted-foreground/80 mt-1.5">
                        This period: {formatOrders(activePoint.periodOrders)}{" "}
                        {activePoint.periodOrders === 1 ? "order" : "orders"} ·{" "}
                        {formatRevenue(activePoint.periodRevenue)}
                    </p>
                </div>
            )}
        </div>
    );
}
