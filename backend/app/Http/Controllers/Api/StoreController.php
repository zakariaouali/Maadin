<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seller;

class StoreController extends Controller
{
    public function show(string $slug)
    {
        $seller = Seller::where('store_slug', $slug)
            ->where('status', 'verified')
            ->select([
                'id', 'store_name', 'store_slug', 'store_description',
                'logo_path', 'banner_path', 'rating', 'total_reviews',
                'level', 'total_orders', 'created_at',
            ])
            ->firstOrFail();

        return response()->json($seller);
    }
}