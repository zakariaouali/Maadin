<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;

class ReviewController extends Controller
{
    public function index(string $productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->where('status', 'approved')
            ->with('customer:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }
}