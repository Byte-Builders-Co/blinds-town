<?php

namespace App\Enums;

enum AdminAlertType: string
{
    case LowStock = 'low_stock';
    case NewOrder = 'new_order';
    case PaymentFailed = 'payment_failed';
    case QcFailed = 'qc_failed';
    case ShipmentFailed = 'shipment_failed';
    case InstallationFailed = 'installation_failed';
    case RefundRequest = 'refund_request';
    case SystemError = 'system_error';
    case ContactInquiry = 'contact_inquiry';

    public function label(): string
    {
        return match ($this) {
            self::LowStock => 'Low Stock',
            self::NewOrder => 'New Order',
            self::PaymentFailed => 'Payment Failed',
            self::QcFailed => 'QC Failed',
            self::ShipmentFailed => 'Shipment Failed',
            self::InstallationFailed => 'Installation Failed',
            self::RefundRequest => 'Refund Request',
            self::SystemError => 'Important System Error',
            self::ContactInquiry => 'New Contact Inquiry',
        };
    }
}
