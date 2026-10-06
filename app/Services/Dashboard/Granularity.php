<?php

namespace App\Services\Dashboard;

/**
 * How a dashboard date range is bucketed for charts.
 */
enum Granularity: string
{
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';
}
