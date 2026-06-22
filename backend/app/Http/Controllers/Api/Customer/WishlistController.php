<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $items = Wishlist::where('customer_id', $request->user()->id)
            ->with(['product' => function ($q) {
                $q->with('primaryImage', 'seller:id,store_name,store_slug');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $exists = Wishlist::where('customer_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already in wishlist.'], 422);
        }

        $item = Wishlist::create([
            'customer_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json($item, 201);
    }

    public function destroy(Request $request, string $productId)
    {
        $deleted = Wishlist::where('customer_id', $request->user()->id)
            ->where('product_id', $productId)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Item not in wishlist.'], 404);
        }

        return response()->json(['message' => 'Removed from wishlist']);
    }
}