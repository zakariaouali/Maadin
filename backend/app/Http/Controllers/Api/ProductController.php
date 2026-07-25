<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private function localeFromRequest(Request $request): string
    {
        return in_array($request->query('locale'), ['fr', 'ar']) ? $request->query('locale') : 'en';
    }

    private function localisedCategoryName(mixed $category, string $locale): string
    {
        if (!$category) return '';
        return match($locale) {
            'fr' => $category->name_fr ?? $category->name,
            'ar' => $category->name_ar ?? $category->name,
            default => $category->name,
        };
    }

    public function index(Request $request)
    {
        $locale = $this->localeFromRequest($request);

        $query = Product::query()
            ->active()
            ->with(['category:id,name,name_fr,name_ar', 'primaryImage:id,product_id,image_path', 'seller:id,user_id,store_name,store_slug,logo_path,level'])
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

        $products->getCollection()->transform(function ($product) use ($locale) {
            if ($product->category) {
                $product->category->localised_name = $this->localisedCategoryName($product->category, $locale);
            }
            return $product;
        });

        return response()->json($products);
    }

    public function show(Request $request, string $slug)
    {
        $locale = $this->localeFromRequest($request);

        $product = Product::where('slug', $slug)
            ->active()
            ->whereHas('seller', fn($q) => $q->where('status', 'verified'))
            ->with(['category', 'images', 'seller:id,user_id,store_name,store_slug,level,rating,total_reviews'])
            ->firstOrFail();

        if ($product->category) {
            $product->category->localised_name = $this->localisedCategoryName($product->category, $locale);
        }

        return response()->json($product);
    }
}