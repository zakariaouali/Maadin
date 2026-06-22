<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    // Get the logged-in seller's own store
    public function show(Request $request)
    {
        $seller = $request->user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'No store found for this account.'], 404);
        }

        return response()->json($seller);
    }

    // Create the store profile (one-time, only if it doesn't exist yet)
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->seller) {
            return response()->json(['message' => 'Store already exists for this account.'], 422);
        }

        $validated = $request->validate([
            'store_name' => 'required|string|min:3|max:100',
            'store_description' => 'nullable|string',
            'phone_number' => 'required|string|max:20',
        ]);

        $validated['user_id'] = $user->id;
        $validated['store_slug'] = $this->generateUniqueSlug($validated['store_name']);

        $seller = Seller::create($validated);

        return response()->json($seller, 201);
    }

    // Update the store profile
    public function update(Request $request)
    {
        $seller = $request->user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'No store found for this account.'], 404);
        }

        $validated = $request->validate([
            'store_name' => 'sometimes|required|string|min:3|max:100',
            'store_description' => 'nullable|string',
            'phone_number' => 'sometimes|required|string|max:20',
            'bank_account_number' => 'nullable|string',
            'bank_name' => 'nullable|string',
        ]);

        if (isset($validated['store_name']) && $validated['store_name'] !== $seller->store_name) {
            $validated['store_slug'] = $this->generateUniqueSlug($validated['store_name'], $seller->id);
        }

        $seller->update($validated);

        return response()->json($seller);
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;

        while (Seller::where('store_slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}