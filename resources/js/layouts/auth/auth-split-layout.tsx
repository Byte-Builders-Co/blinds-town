import { Link, usePage } from "@inertiajs/react";
import { Ruler, ShieldCheck, Truck } from "lucide-react";
import AppLogo from "@/components/app-logo";
import { home } from "@/routes";
import type { AuthLayoutProps } from "@/types";

const trustPoints = [
    {
        icon: Ruler,
        text: "Made to your exact window measurements",
    },
    {
        icon: Truck,
        text: "Free shipping on every order",
    },
    {
        icon: ShieldCheck,
        text: "Quality guaranteed, built to last",
    },
];

function Slats() {
    const slats = Array.from({ length: 14 });

    return (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-3 overflow-hidden opacity-90">
            {slats.map((_, i) => (
                <div
                    key={i}
                    className="h-3 shrink-0 rounded-full"
                    style={{
                        background:
                            "linear-gradient(90deg, oklch(0.98 0.01 75 / 0.16), oklch(0.98 0.01 75 / 0.05) 45%, oklch(0.98 0.01 75 / 0.16))",
                        transform: `scaleX(${1 - Math.abs(i - 6.5) * 0.012})`,
                    }}
                />
            ))}
        </div>
    );
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="bg-background relative grid h-dvh flex-col items-center justify-center px-6 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div
                className="relative hidden h-full flex-col justify-between overflow-hidden p-10 text-white lg:flex"
                style={{
                    background:
                        "linear-gradient(160deg, oklch(0.3 0.05 45), oklch(0.5 0.13 45) 55%, oklch(0.62 0.15 60))",
                }}
            >
                <Slats />

                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-2 text-lg font-semibold"
                >
                    <div className="rounded-md bg-white/95 px-2 py-1">
                        <AppLogo />
                    </div>
                </Link>

                <div className="relative z-20 max-w-sm">
                    <h2 className="text-3xl leading-tight font-semibold text-balance">
                        Made-to-measure blinds, delivered to your door.
                    </h2>
                    <p className="mt-3 text-white/80">
                        Join {name} for a faster checkout, order tracking, and
                        exclusive offers on custom window treatments.
                    </p>

                    <ul className="mt-8 space-y-4">
                        {trustPoints.map((point) => (
                            <li
                                key={point.text}
                                className="flex items-center gap-3 text-sm text-white/90"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                                    <point.icon className="size-4" />
                                </span>
                                {point.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative z-20 text-xs text-white/60">
                    &copy; {new Date().getFullYear()} {name}. All rights
                    reserved.
                </p>
            </div>

            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-95">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogo />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-muted-foreground text-sm text-balance">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
