import { router, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { store, destroy } from '@/routes/wishlist';
import { login } from '@/routes';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

export function WishlistButton({
    product,
    initialWishlisted = false,
    className,
}: {
    product: Product;
    initialWishlisted?: boolean;
    className?: string;
}) {
    const { auth } = usePage().props;
    const [wishlisted, setWishlisted] = useState(initialWishlisted);
    const [pending, setPending] = useState(false);

    const toggle = () => {
        if (!auth.user) {
            router.visit(login().url);
            return;
        }

        setPending(true);
        const next = !wishlisted;
        setWishlisted(next);

        const action = next ? store(product) : destroy(product);

        router.visit(action.url, {
            method: action.method,
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setPending(false),
            onError: () => setWishlisted(!next),
        });
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={pending}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
            }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(className)}
        >
            <Heart className={wishlisted ? 'fill-current text-red-500' : ''} />
        </Button>
    );
}
