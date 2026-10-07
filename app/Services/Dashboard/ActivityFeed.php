<?php

namespace App\Services\Dashboard;

use App\Enums\PaymentStatus;
use App\Enums\RefundStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Refund;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * A merged, newest-first timeline of what happened in the store, built from
 * the records themselves (orders, payments, refunds, customers, products)
 * rather than a separate log that could drift out of sync.
 *
 * @phpstan-type FeedEntry array{type: string, title: string, description: string, at: CarbonInterface, timestamp: int, subject: array{type: string, id: int}}
 */
class ActivityFeed
{
    /** How many entries each source contributes before the merge. */
    private const PER_SOURCE = 6;

    /** A product edited within this many seconds of creation counts as "added" only. */
    private const UPDATE_GRACE_SECONDS = 60;

    /**
     * @return list<array{type: string, title: string, description: string, at: string, subject: array{type: string, id: int}|null}>
     */
    public function recent(int $limit = 10): array
    {
        return array_values(collect()
            ->concat($this->newOrders())
            ->concat($this->shippedOrders())
            ->concat($this->payments())
            ->concat($this->refunds())
            ->concat($this->newCustomers())
            ->concat($this->addedProducts())
            ->concat($this->updatedProducts())
            ->sortByDesc('timestamp')
            ->take($limit)
            ->map(fn (array $entry) => [
                'type' => $entry['type'],
                'title' => $entry['title'],
                'description' => $entry['description'],
                'at' => $entry['at']->toIso8601String(),
                'subject' => $entry['subject'],
            ])
            ->all());
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    private function newOrders(): Collection
    {
        return Order::query()->with('user')->latest()->limit(self::PER_SOURCE)->get()
            ->map(fn (Order $order) => $this->entry(
                'order_received',
                'New order received',
                "{$order->order_number} · ".($order->user->name ?? $order->shipping_name).' · '.Money::format((float) $order->total, $order->currency),
                $order->created_at,
                'order',
                $order->id,
            ));
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    private function shippedOrders(): Collection
    {
        return Order::query()->whereNotNull('shipped_at')->orderByDesc('shipped_at')->limit(self::PER_SOURCE)->get()
            ->map(fn (Order $order) => $this->entry(
                'order_shipped',
                'Order shipped',
                $order->carrier ? "{$order->order_number} · via {$order->carrier}" : $order->order_number,
                $order->shipped_at,
                'order',
                $order->id,
            ));
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    private function payments(): Collection
    {
        return Payment::query()->with('order')
            ->where('status', PaymentStatus::Paid->value)
            ->whereNotNull('paid_at')
            ->orderByDesc('paid_at')
            ->limit(self::PER_SOURCE)
            ->get()
            ->map(fn (Payment $payment) => $this->entry(
                'payment_received',
                'Payment received',
                Money::format((float) $payment->amount, $payment->currency)." · {$payment->order->order_number}",
                $payment->paid_at,
                'order',
                $payment->order_id,
            ));
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    private function refunds(): Collection
    {
        return Refund::query()->with('payment.order')
            ->where('status', RefundStatus::Refunded->value)
            ->orderByDesc('updated_at')
            ->limit(self::PER_SOURCE)
            ->get()
            ->map(fn (Refund $refund) => $this->entry(
                'refund_processed',
                'Refund processed',
                Money::format((float) $refund->amount, $refund->payment->currency)." · {$refund->payment->order->order_number}",
                $refund->updated_at,
                'order',
                $refund->payment->order_id,
            ));
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    private function newCustomers(): Collection
    {
        return User::role('customer')->latest()->limit(self::PER_SOURCE)->get()
            ->map(fn (User $user) => $this->entry(
                'customer_registered',
                'New customer registered',
                $user->name,
                $user->created_at,
                'customer',
                $user->id,
            ));
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    private function addedProducts(): Collection
    {
        return Product::query()->latest()->limit(self::PER_SOURCE)->get()
            ->map(fn (Product $product) => $this->entry('product_added', 'Product added', $product->name, $product->created_at, 'product', $product->id));
    }

    /**
     * @return Collection<int, FeedEntry>
     */
    private function updatedProducts(): Collection
    {
        return Product::query()->orderByDesc('updated_at')->limit(self::PER_SOURCE * 2)->get()
            ->filter(fn (Product $product) => $product->updated_at->diffInSeconds($product->created_at, true) > self::UPDATE_GRACE_SECONDS)
            ->take(self::PER_SOURCE)
            ->map(fn (Product $product) => $this->entry('product_updated', 'Product updated', $product->name, $product->updated_at, 'product', $product->id));
    }

    /**
     * @return FeedEntry
     */
    private function entry(string $type, string $title, string $description, CarbonInterface $at, string $subjectType, int $subjectId): array
    {
        return [
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'at' => $at,
            'timestamp' => $at->getTimestamp(),
            'subject' => ['type' => $subjectType, 'id' => $subjectId],
        ];
    }
}
