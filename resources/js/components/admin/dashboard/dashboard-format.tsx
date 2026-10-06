import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type DashboardFormat = {
    /** Full amount, e.g. $1,234.50 (whole units once it passes 10,000). */
    money: (value: number) => string;
    /** Short amount for chart axes, e.g. $1.2K. */
    compactMoney: (value: number) => string;
    number: (value: number) => string;
    compactNumber: (value: number) => string;
    /** Signed percentage change, e.g. +12.8% or −5.2%. */
    percent: (value: number) => string;
    /** Unsigned share of a whole, e.g. 74.6%. */
    share: (value: number) => string;
};

function createFormat(currency: string): DashboardFormat {
    // Indian grouping (₹4,85,600) for rupees, standard grouping otherwise.
    const locale = currency === "INR" ? "en-IN" : "en-US";

    const currencyFormat = (options: Intl.NumberFormatOptions) => {
        try {
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency,
                ...options,
            });
        } catch {
            // An unrecognised currency code should never break the page.
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                ...options,
            });
        }
    };

    const fine = currencyFormat({});
    const whole = currencyFormat({ maximumFractionDigits: 0 });
    const compactMoney = currencyFormat({
        notation: "compact",
        maximumFractionDigits: 1,
    });
    const plain = new Intl.NumberFormat(locale);
    const compact = new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: 1,
    });

    return {
        money: (value) =>
            Math.abs(value) >= 10_000
                ? whole.format(value)
                : fine.format(value),
        compactMoney: (value) => compactMoney.format(value),
        number: (value) => plain.format(value),
        compactNumber: (value) => compact.format(value),
        percent: (value) =>
            `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(1)}%`,
        share: (value) => `${value.toFixed(1)}%`,
    };
}

const DashboardFormatContext = createContext<DashboardFormat>(
    createFormat("USD"),
);

export function DashboardFormatProvider({
    currency,
    children,
}: {
    currency: string;
    children: ReactNode;
}) {
    return (
        <DashboardFormatContext.Provider value={createFormat(currency)}>
            {children}
        </DashboardFormatContext.Provider>
    );
}

export function useDashboardFormat(): DashboardFormat {
    return useContext(DashboardFormatContext);
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
});

export function formatDate(value: string): string {
    return dateFormat.format(new Date(value));
}

export function formatTime(value: string): string {
    return timeFormat.format(new Date(value));
}
