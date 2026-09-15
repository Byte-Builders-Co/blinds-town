<?php

namespace App\Services;

use App\Enums\AdjustmentType;
use App\Enums\AdminAlertType;
use App\Models\Accessory;
use App\Models\Fabric;
use App\Models\InventoryAdjustment;
use App\Models\User;
use App\Services\Notifications\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryAdjustmentService
{
    public function __construct(
        private readonly AdminAlertService $alerts,
        private readonly NotificationService $notifications,
    ) {}

    /**
     * Apply a stock adjustment to an inventory item and record its history.
     *
     * @param  string  $quantityColumn  The column holding the available quantity ("available_quantity" or "stock").
     */
    public function adjust(
        Fabric|Accessory $item,
        string $quantityColumn,
        AdjustmentType $type,
        float $quantity,
        string $reason,
        User $admin,
    ): InventoryAdjustment {
        $previousQuantity = (float) $item->{$quantityColumn};

        $newQuantity = match ($type) {
            AdjustmentType::Increase => $previousQuantity + $quantity,
            AdjustmentType::Decrease => $previousQuantity - $quantity,
            AdjustmentType::Correction => $quantity,
        };

        if ($newQuantity < 0) {
            throw ValidationException::withMessages(['quantity' => 'Stock cannot be adjusted below zero.']);
        }

        $adjustment = DB::transaction(function () use ($item, $quantityColumn, $type, $reason, $admin, $previousQuantity, $newQuantity) {
            $item->update([$quantityColumn => $newQuantity]);

            return $item->adjustments()->create([
                'type' => $type,
                'previous_quantity' => $previousQuantity,
                'adjustment' => $newQuantity - $previousQuantity,
                'new_quantity' => $newQuantity,
                'reason' => $reason,
                'adjusted_by' => $admin->id,
            ]);
        });

        $minimumStock = (float) $item->minimum_stock;

        if ($previousQuantity > $minimumStock && $newQuantity <= $minimumStock && $this->notifications->isEventEnabled('low_stock')) {
            $this->alerts->create(
                AdminAlertType::LowStock,
                "Low stock: {$item->name}",
                "{$item->name} ({$item->sku}) has dropped to {$newQuantity}, at or below its minimum stock of {$minimumStock}.",
            );
        }

        return $adjustment;
    }
}
