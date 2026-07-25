<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;
        abort_if(!$seller, 404, 'No store found.');

        $reviews = Review::where('seller_id', $seller->id)
            ->with([
                'product:id,name,slug',
                'product.primaryImage:id,product_id,image_path',
                'customer:id,name,avatar_path',
            ])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($reviews);
    }
}
