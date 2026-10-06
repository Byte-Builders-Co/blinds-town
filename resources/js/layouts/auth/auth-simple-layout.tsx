import { Link } from "@inertiajs/react";
import AppLogo from "@/components/app-logo";
import { home } from "@/routes";
import type { AuthLayoutProps } from "@/types";

export default function AuthSimpleLayout({
    children,
    title,
    description,
    card = true,
}: AuthLayoutProps) {
    const header = (
        <div className="mb-4 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    );

    return (
        <div className="flex min-h-svh flex-col items-center gap-6 bg-background p-6 pt-10 md:p-10 md:pt-16">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Link href={home()} className="flex justify-center">
                        <span className="rounded-md dark:bg-white dark:px-2 dark:py-1"><AppLogo /></span>
                    </Link>

                    {card ? (
                        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
                            {header}
                            {children}
                        </div>
                    ) : (
                        <div>
                            {header}
                            {children}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-muted-foreground max-w-xs pb-4 text-center text-xs">
                By continuing, you agree to our Terms &amp; Conditions and
                Privacy Policy.
            </p>
        </div>
    );
}
