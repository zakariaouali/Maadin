<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->active()
            ->with(['category:id,name', 'primaryImage:id,product_id,image_path', 'seller:id,user_id,store_name,store_slug,logo_path,level'])
            ->whereHas('seller', fn($q) => $q->where('status', 'verified'))
            ->select(['id','seller_id','category_id','name','slug','price','rating','stock_quantity','total_sales','created_at']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        if ($request->filled('search')) {
            $query->whereFullText(['name', 'description', 'short_description'], $request->search);
        }

        $sort = $request->get('sort', 'newest');
        match ($sort) {
            'price_low' => $query->orderBy('price', 'asc'),
            'price_high' => $query->orderBy('price', 'desc'),
            'popular' => $query->orderBy('total_sales', 'desc'),
            'rating' => $query->orderBy('rating', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $products = $query->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->active()
            ->with(['category', 'images', 'seller:id,user_id,store_name,store_slug,level,rating,total_reviews'])
            ->firstOrFail();

        return response()->json($product);
    }
}