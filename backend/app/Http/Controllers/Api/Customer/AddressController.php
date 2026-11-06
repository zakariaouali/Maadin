<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    /** Enough for home, work and family; stops the list growing without limit */
    private const MAX_ADDRESSES = 10;

    public function index(Request $request)
    {
        return response()->json(
            $request->user()->addresses()->orderByDesc('is_default')->orderBy('id')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $user = $request->user();

        if ($user->addresses()->count() >= self::MAX_ADDRESSES) {
            return response()->json(['message' => __('You can save up to :count addresses.', ['count' => self::MAX_ADDRESSES])], 422);
        }

        $address = DB::transaction(function () use ($user, $validated) {
            // The first address is the default; a new default replaces the old one
            $makeDefault = ($validated['is_default'] ?? false) || !$user->addresses()->exists();
            if ($makeDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            return $user->addresses()->create($validated + ['is_default' => $makeDefault]);
        });

        return response()->json($address, 201);
    }

    public function update(Request $request, string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $validated = $this->validated($request);

        DB::transaction(function () use ($request, $address, $validated) {
            if ($validated['is_default'] ?? false) {
                $request->user()->addresses()->whereKeyNot($address->id)->update(['is_default' => false]);
            }
            // Un-ticking "default" on the only default would leave none: keep it
            if (!($validated['is_default'] ?? false) && $address->is_default) {
                $validated['is_default'] = true;
            }
            $address->update($validated);
        });

        return response()->json($address->fresh());
    }

    public function destroy(Request $request, string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        DB::transaction(function () use ($request, $address) {
            $wasDefault = $address->is_default;
            $address->delete();

            // Deleting the default promotes the most recent remaining address
            if ($wasDefault) {
                $request->user()->addresses()->orderByDesc('id')->first()?->update(['is_default' => true]);
            }
        });

        return response()->json(['message' => __('Address deleted')]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'label' => 'nullable|string|max:50',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'postal_code' => 'nullable|string|max:10',
            'is_default' => 'sometimes|boolean',
        ]);
    }
}
