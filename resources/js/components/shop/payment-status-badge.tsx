import { Badge } from '@/components/ui/badge';
import { PAYMENT_STATUS_LABELS } from '@/types';
import type { PaymentStatus } from '@/types';

const VARIANTS: Record<
    PaymentStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    pending: 'secondary',
    processing: 'secondary',
    paid: 'default',
    failed: 'destructive',
    cancelled: 'outline',
    refunded: 'outline',
    partially_refunded: 'outline',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
    return (
        <Badge variant={VARIANTS[status]}>
            {PAYMENT_STATUS_LABELS[status]}
        </Badge>
    );
}
