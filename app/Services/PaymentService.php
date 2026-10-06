<?php

namespace App\Services;

use App\Enums\AdminAlertType;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\RefundStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Refund;
use App\Notifications\OrderConfirmationNotification;
use App\Notifications\PaymentFailedNotification;
use App\Notifications\RefundCompletedNotification;
use App\Services\Notifications\NotificationService;
use App\Services\Stripe\PaymentGateway;

class PaymentService
{
    public function __construct(
        private readonly AdminAlertService $alerts,
        private readonly NotificationService $notifications,
    ) {}

    public function createPending(Order $order, PaymentMethod $method): Payment
    {
        return $order->payment()->create([
            'method' => $method,
            'gateway' => $method === PaymentMethod::Online ? 'stripe' : null,
            'amount' => $order->total,
            'currency' => $order->currency,
            'status' => PaymentStatus::Pending,
        ]);
    }

    public function markPaid(Payment $payment, ?string $gatewayTransactionId = null): void
    {
        $payment->update([
            'status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'gateway_transaction_id' => $gatewayTransactionId ?? $payment->gateway_transaction_id,
        ]);
    }

    /**
     * Mark a payment paid from a verified Stripe PaymentIntent and confirm its order.
     *
     * Idempotent: safe to call from both the webhook and the checkout success page,
     * since it only acts while the payment is still Pending.
     */
    public function confirmSucceeded(Payment $payment, string $paymentIntentId): bool
    {
        if ($payment->status !== PaymentStatus::Pending) {
            return false;
        }

        $this->markPaid($payment, $paymentIntentId);

        $order = $payment->order;
        $order->recordStatus(OrderStatus::Confirmed, 'Payment received');

        if ($this->notifications->isEventEnabled('payment_success')) {
            $order->notifyCustomer(new OrderConfirmationNotification($order));
        }

        return true;
    }

    public function markFailed(Payment $payment, string $reason): void
    {
        $payment->update([
            'status' => PaymentStatus::Failed,
            'failure_reason' => $reason,
        ]);

        $order = $payment->order;

        $this->alerts->create(
            AdminAlertType::PaymentFailed,
            "Payment failed — {$order->order_number}",
            $reason,
            route('admin.orders.show', $order),
        );

        if ($this->notifications->isEventEnabled('payment_failed')) {
            $order->notifyCustomer(new PaymentFailedNotification($payment));
        }
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): Refund
    {
        $gatewayReference = null;
        $status = RefundStatus::Requested;

        if ($payment->gateway === 'stripe' && $payment->gateway_transaction_id) {
            $result = app(PaymentGateway::class)->refund($payment->gateway_transaction_id, $amount);
            $gatewayReference = $result['id'];
            $status = $result['status'] === 'succeeded' ? RefundStatus::Refunded : RefundStatus::Processing;
        } else {
            $status = RefundStatus::Refunded;
        }

        $refund = $payment->refunds()->create([
            'amount' => $amount,
            'reason' => $reason,
            'status' => $status,
            'gateway_reference' => $gatewayReference,
        ]);

        if ($status === RefundStatus::Refunded) {
            $totalRefunded = (float) $payment->refunds()->where('status', RefundStatus::Refunded)->sum('amount');
            $payment->update([
                'status' => $totalRefunded >= (float) $payment->amount
                    ? PaymentStatus::Refunded
                    : PaymentStatus::PartiallyRefunded,
            ]);

            $payment->order->notifyCustomer(new RefundCompletedNotification($refund));
        }

        return $refund;
    }
}
