<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\ActivityFeed;
use App\Services\Dashboard\DashboardRange;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Every prop except the range itself is a closure, so changing the date
     * range can reload just the range-dependent panels as a partial visit.
     */
    public function index(Request $request, DashboardService $dashboard, ActivityFeed $activity): Response
    {
        $range = DashboardRange::fromRequest($request);

        return Inertia::render('admin/dashboard', [
            'range' => $range->toArray(),
            'currency' => $dashboard->currency(),
            'kpis' => fn () => $dashboard->kpis($range),
            'sales' => fn () => $dashboard->sales($range),
            'topProducts' => fn () => $dashboard->topProducts($range),
            'categories' => fn () => $dashboard->categorySales($range),
            'recentOrders' => fn () => $dashboard->recentOrders(),
            'activity' => fn () => $activity->recent(),
        ]);
    }
}
