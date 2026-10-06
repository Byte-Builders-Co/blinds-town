import { router, usePage } from "@inertiajs/react";
import { Heart } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { store, destroy } from "@/routes/wishlist";
import { login } from "@/routes";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Client-side record of wishlist toggles made during this session. Inertia
 * restores cached (stale) props when navigating back, so the server-provided
 * initial value alone can show an outdated heart. The latest local toggle wins.
 */
const localState = new Map<string, boolean>();
const listeners = new Set<() => void>();

function setLocal(key: string, value: boolean) {
    localState.set(key, value);
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function WishlistButton({
    product,
    initialWishlisted = false,
    variant = "outline",
    className,
}: {
    product: Product;
    initialWishlisted?: boolean;
    variant?: "outline" | "ghost";
    className?: string;
}) {
    const { auth } = usePage().props;
    const key = `${auth.user?.id ?? "guest"}:${product.id}`;
    const local = useSyncExternalStore(subscribe, () => localState.get(key));
    const wishlisted = local ?? initialWishlisted;
    const [pending, setPending] = useState(false);

    const toggle = () => {
        if (!auth.user) {
            router.visit(login().url);
            return;
        }

        setPending(true);
        const next = !wishlisted;
        setLocal(key, next);

        const action = next ? store(product) : destroy(product);

        router.visit(action.url, {
            method: action.method,
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setPending(false),
            onError: () => setLocal(key, !next),
        });
    };

    return (
        <Button
            type="button"
            variant={variant}
            size="icon"
            disabled={pending}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
            }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(className)}
        >
            <Heart className={wishlisted ? "fill-current text-red-500" : ""} />
        </Button>
    );
}
