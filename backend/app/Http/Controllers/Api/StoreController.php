<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function show(Request $request, string $slug)
    {
        $locale = in_array($request->query('locale'), ['fr', 'ar']) ? $request->query('locale') : 'en';
        $seller = Seller::where('store_slug', $slug)
            ->where('status', 'verified')
            ->select([
                'id', 'user_id', 'store_name', 'store_slug', 'store_description',
                'seller_bio', 'logo_path', 'banner_path', 'shop_photo_path', 'portfolio_paths',
                'rating', 'total_reviews', 'level', 'total_orders', 'response_time_hours', 'created_at',
            ])
            ->firstOrFail();

        $products = $seller->products()
            ->where('is_active', true)
            ->with(['images' => fn($q) => $q->where('is_primary', true), 'category:id,name,name_fr,name_ar'])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'seller_id', 'category_id', 'name', 'slug', 'price', 'stock_quantity', 'rating', 'total_reviews', 'short_description']);

        $products->each(function ($product) use ($locale) {
            if ($product->category) {
                $product->category->localised_name = match($locale) {
                    'fr' => $product->category->name_fr ?? $product->category->name,
                    'ar' => $product->category->name_ar ?? $product->category->name,
                    default => $product->category->name,
                };
            }
        });

        return response()->json([
            'store'    => $seller,
            'products' => $products,
        ]);
    }
}