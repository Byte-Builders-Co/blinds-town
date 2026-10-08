<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/activity-logs/index', [
            'logs' => ActivityLog::query()
                ->with('causer:id,first_name,last_name')
                ->when($request->string('search')->toString(), fn ($query, $search) => $query->where('description', 'like', "%{$search}%"))
                ->when($request->string('action')->toString(), fn ($query, $action) => $query->where('action', $action))
                ->when($request->date('from'), fn ($query, $from) => $query->where('created_at', '>=', $from->startOfDay()))
                ->when($request->date('to'), fn ($query, $to) => $query->where('created_at', '<=', $to->endOfDay()))
                ->latest('id')
                ->paginate(25)
                ->withQueryString()
                ->through(fn (ActivityLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'causer' => $log->causer?->name,
                    'created_at' => $log->created_at?->toIso8601String(),
                ]),
            'filters' => $request->only('search', 'action', 'from', 'to'),
            'actions' => ActivityLog::query()->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
