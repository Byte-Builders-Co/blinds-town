import type { InertiaLinkProps } from "@inertiajs/react";
import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps["href"]>): string {
    return typeof url === "string" ? url : url.url;
}

export function formatCurrency(
    amount: string | number,
    currency: string = "usd",
): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(Number(amount));
}

const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-US", {
    numeric: "always",
});

export function formatRelativeTime(value: string): string {
    const seconds = (new Date(value).getTime() - Date.now()) / 1000;

    for (const [unit, unitSeconds] of RELATIVE_TIME_UNITS) {
        if (Math.abs(seconds) >= unitSeconds) {
            return relativeTimeFormatter.format(
                Math.round(seconds / unitSeconds),
                unit,
            );
        }
    }

    return relativeTimeFormatter.format(Math.round(seconds), "second");
}
