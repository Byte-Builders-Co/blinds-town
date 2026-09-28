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
            <h1 className="text-2xl font-normal text-[#0F1111]">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    );

    return (
        <div className="flex min-h-svh flex-col items-center gap-6 bg-white p-6 pt-10 md:p-10 md:pt-16">
            <div className="w-full max-w-87.5">
                <div className="flex flex-col gap-6">
                    <Link href={home()} className="flex justify-center">
                        <AppLogo />
                    </Link>

                    {card ? (
                        <div className="rounded-lg border border-[#ddd] bg-white p-6 shadow-[0_2px_5px_rgba(15,17,17,0.15)]">
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
