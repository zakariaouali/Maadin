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

        $products = $seller->products()
            ->where('is_active', true)
            ->with(['images' => fn($q) => $q->where('is_primary', true), 'category:id,name'])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'seller_id', 'category_id', 'name', 'slug', 'price', 'stock_quantity', 'rating', 'total_reviews', 'short_description']);

        return response()->json([
            'store'    => $seller,
            'products' => $products,
        ]);
    }
}