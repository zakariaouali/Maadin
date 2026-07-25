<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with([
            'customer:id,name,avatar_path',
            'product:id,name,slug',
            'seller:id,store_name,store_slug',
        ])->withTrashed();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        $reviews = $query->latest()->paginate(20);

        return response()->json($reviews);
    }

    public function approve(Review $review)
    {
        $review->restore(); // in case soft-deleted
        $review->update(['status' => 'approved']);
        $this->recalculate($review);
        return response()->json(['message' => 'Review approved.']);
    }

    public function reject(Review $review)
    {
        $review->update(['status' => 'rejected']);
        $this->recalculate($review);
        return response()->json(['message' => 'Review rejected.']);
    }

    public function destroy(Review $review)
    {
        $review->delete();
        $this->recalculate($review);
        return response()->json(['message' => 'Review deleted.']);
    }

    private function recalculate(Review $review): void
    {
        $product = $review->product;
        if ($product) {
            $avg = Review::where('product_id', $product->id)->where('status', 'approved')->avg('rating') ?? 0;
            $count = Review::where('product_id', $product->id)->where('status', 'approved')->count();
            $product->update(['rating' => round($avg, 2), 'total_reviews' => $count]);
        }

        $seller = $review->seller;
        if ($seller) {
            $avg = Review::where('seller_id', $seller->id)->where('status', 'approved')->avg('rating') ?? 0;
            $count = Review::where('seller_id', $seller->id)->where('status', 'approved')->count();
            $seller->update(['rating' => round($avg, 2), 'total_reviews' => $count]);
        }
    }
}
