<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreAddressRequest;
use App\Http\Requests\Settings\UpdateAddressRequest;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('settings/addresses', [
            'addresses' => $request->user()->addresses()->orderByDesc('is_default')->get(),
        ]);
    }

    public function store(StoreAddressRequest $request): RedirectResponse
    {
        $address = $request->user()->addresses()->create($request->validated());

        if ($address->is_default) {
            $address->makeDefault();
        }

        return redirect()->route('addresses.index');
    }

    public function update(UpdateAddressRequest $request, Address $address): RedirectResponse
    {
        $address->update($request->validated());

        if ($address->is_default) {
            $address->makeDefault();
        }

        return redirect()->route('addresses.index');
    }

    public function destroy(Request $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $address->delete();

        return redirect()->route('addresses.index');
    }

    public function setDefault(Request $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $address->makeDefault();

        return redirect()->route('addresses.index');
    }
}
