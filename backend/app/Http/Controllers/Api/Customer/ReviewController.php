<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|min:10',
        ]);

        $order = $request->user()->orders()->findOrFail($validated['order_id']);

        if ($order->status !== 'delivered') {
            return response()->json([
                'message' => 'You can only review products from delivered orders.',
            ], 422);
        }

        $itemExists = $order->items()->where('product_id', $validated['product_id'])->exists();

        if (!$itemExists) {
            return response()->json([
                'message' => 'This product was not part of that order.',
            ], 422);
        }

        $alreadyReviewed = Review::where('product_id', $validated['product_id'])
            ->where('customer_id', $request->user()->id)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'message' => 'You have already reviewed this product.',
            ], 422);
        }

        $review = Review::create([
            'product_id' => $validated['product_id'],
            'order_id' => $order->id,
            'customer_id' => $request->user()->id,
            'seller_id' => $order->seller_id,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'],
            'is_verified_purchase' => true,
            'status' => 'approved', // auto-approve for MVP; admin moderation can flag later
        ]);

        $this->recalculateProductRating($validated['product_id']);
        $this->recalculateSellerRating($order->seller_id);

        return response()->json($review, 201);
    }

    public function update(Request $request, string $id)
    {
        $review = Review::where('customer_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'content' => 'sometimes|required|string|min:10',
        ]);

        $review->update($validated);

        $this->recalculateProductRating($review->product_id);
        $this->recalculateSellerRating($review->seller_id);

        return response()->json($review);
    }

    public function destroy(Request $request, string $id)
    {
        $review = Review::where('customer_id', $request->user()->id)->findOrFail($id);
        $productId = $review->product_id;
        $sellerId = $review->seller_id;

        $review->delete();

        $this->recalculateProductRating($productId);
        $this->recalculateSellerRating($sellerId);

        return response()->json(['message' => 'Review deleted']);
    }

    public function myReviews(Request $request)
    {
        $reviews = Review::where('customer_id', $request->user()->id)
            ->with('product:id,name,slug')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }

    private function recalculateProductRating(int $productId): void
    {
        $stats = Review::where('product_id', $productId)
            ->where('status', 'approved')
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        \App\Models\Product::where('id', $productId)->update([
            'rating' => round($stats->avg_rating ?? 0, 2),
            'total_reviews' => $stats->total ?? 0,
        ]);
    }

    private function recalculateSellerRating(int $sellerId): void
    {
        $stats = Review::where('seller_id', $sellerId)
            ->where('status', 'approved')
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        \App\Models\Seller::where('id', $sellerId)->update([
            'rating' => round($stats->avg_rating ?? 0, 2),
            'total_reviews' => $stats->total ?? 0,
        ]);
    }
}