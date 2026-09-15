<?php

namespace App\Enums;

enum OptionGroupKind: string
{
    case Fabric = 'fabric';
    case Color = 'color';
    case Material = 'material';
    case Pattern = 'pattern';
    case Opacity = 'opacity';
    case MountType = 'mount_type';
    case ControlType = 'control_type';
    case ChainCord = 'chain_cord';
    case OperationType = 'operation_type';
    case Motor = 'motor';
    case Mechanism = 'mechanism';
    case Accessory = 'accessory';
    case Custom = 'custom';
}
