<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCustomerStatusRequest;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/customers/index', [
            'customers' => User::role('customer')
                ->when($request->string('search')->toString(), fn ($query, $search) => $query->where(fn ($q) => $q
                    ->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only('search', 'status'),
            'statuses' => UserStatus::cases(),
        ]);
    }

    public function show(User $customer): Response
    {
        abort_unless($customer->isCustomer(), 404);

        return Inertia::render('admin/customers/show', [
            'customer' => $customer->load(['addresses', 'orders']),
            'statuses' => UserStatus::cases(),
        ]);
    }

    public function updateStatus(UpdateCustomerStatusRequest $request, User $customer): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);

        $customer->update(['status' => $request->validated('status')]);

        ActivityLog::record(
            'status_changed',
            $customer,
            "Set {$customer->name}'s status to {$request->validated('status')}",
        );

        return redirect()->route('admin.customers.show', $customer);
    }
}
