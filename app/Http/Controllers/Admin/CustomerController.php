<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomerRequest;
use App\Http\Requests\Admin\UpdateCustomerRequest;
use App\Http\Requests\Admin\UpdateCustomerStatusRequest;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as ResponseFacade;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
    /**
     * @var array<string, string>
     */
    private const SORTABLE_COLUMNS = [
        'id' => 'id',
        'first_name' => 'first_name',
        'last_name' => 'last_name',
        'email' => 'email',
        'last_login_at' => 'last_login_at',
        'created_at' => 'created_at',
    ];

    public function index(Request $request): Response
    {
        $sort = $request->string('sort')->toString();
        $sortColumn = self::SORTABLE_COLUMNS[$sort] ?? self::SORTABLE_COLUMNS['created_at'];
        $direction = $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc';

        return Inertia::render('admin/customers/index', [
            'customers' => $this->filteredCustomers($request)
                ->orderBy($sortColumn, $direction)
                ->paginate(20)
                ->withQueryString(),
            'filters' => [
                ...$request->only(['search', 'status', 'sort']),
                'direction' => $direction,
            ],
            'statuses' => UserStatus::cases(),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $customers = $this->filteredCustomers($request)->latest()->get();

        return ResponseFacade::streamDownload(function () use ($customers) {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                abort(500, 'Unable to open output stream for CSV export.');
            }

            fputcsv($handle, ['ID', 'First Name', 'Last Name', 'Email', 'Mobile Number', 'Status', 'Last Login', 'Created At']);

            foreach ($customers as $customer) {
                fputcsv($handle, [
                    $customer->id,
                    $customer->first_name,
                    $customer->last_name,
                    $customer->email,
                    $customer->mobile_number,
                    $customer->status->value,
                    $customer->last_login_at?->toDateTimeString(),
                    $customer->created_at?->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, 'customers-'.now()->format('Y-m-d-His').'.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @return Builder<User>
     */
    private function filteredCustomers(Request $request): Builder
    {
        return User::role('customer')
            ->when($request->string('search')->toString(), fn ($query, $search) => $query->where(fn ($q) => $q
                ->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")))
            ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status));
    }

    public function create(): Response
    {
        return Inertia::render('admin/customers/create', [
            'statuses' => UserStatus::cases(),
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $customer = User::query()->create([
            ...$request->safe()->except('password'),
            'password' => $request->validated('password'),
        ]);
        $customer->forceFill(['email_verified_at' => now()])->save();
        $customer->assignRole('customer');

        ActivityLog::record('created', $customer, "Created customer {$customer->name}");

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$customer->name} created."]);

        return redirect()->route('admin.customers.show', $customer);
    }

    public function show(User $customer): Response
    {
        abort_unless($customer->isCustomer(), 404);

        return Inertia::render('admin/customers/show', [
            'customer' => $customer->load(['addresses', 'orders']),
            'statuses' => UserStatus::cases(),
        ]);
    }

    public function edit(User $customer): Response
    {
        abort_unless($customer->isCustomer(), 404);

        return Inertia::render('admin/customers/edit', [
            'customer' => $customer,
            'statuses' => UserStatus::cases(),
        ]);
    }

    public function update(UpdateCustomerRequest $request, User $customer): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);

        $customer->update($request->validated());

        ActivityLog::record('updated', $customer, "Updated customer {$customer->name}");

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$customer->name} updated."]);

        return redirect()->route('admin.customers.show', $customer);
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

    public function destroy(User $customer): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);

        ActivityLog::record('deleted', $customer, "Deleted customer {$customer->name}");

        $customer->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$customer->name} deleted."]);

        return redirect()->route('admin.customers.index');
    }
}
