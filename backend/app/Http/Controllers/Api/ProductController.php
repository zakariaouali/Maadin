<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
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

        // Query values can arrive as arrays (?x[]=1) or junk (?per_page=abc);
        // read them through typed accessors so they can never cause a 500.
        if ($request->integer('category_id') > 0) {
            $query->whereIn('category_id', Category::idsIncludingChildren($request->integer('category_id')));
        }

        if (is_numeric($request->query('min_price'))) {
            $query->where('price', '>=', (float) $request->query('min_price'));
        }

        if (is_numeric($request->query('max_price'))) {
            $query->where('price', '<=', (float) $request->query('max_price'));
        }

        if (is_numeric($request->query('min_rating'))) {
            $query->where('rating', '>=', (float) $request->query('min_rating'));
        }

        $search = is_string($request->query('search')) ? trim($request->query('search')) : '';
        if ($search !== '') {
            $query->whereFullText(['name', 'description', 'short_description'], $search);
        }

        $sort = is_string($request->query('sort')) ? $request->query('sort') : 'newest';
        match ($sort) {
            'price_low' => $query->orderBy('price', 'asc'),
            'price_high' => $query->orderBy('price', 'desc'),
            'popular' => $query->orderBy('total_sales', 'desc'),
            'rating' => $query->orderBy('rating', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        // 1..48 items per page: an unbounded per_page would let one request pull the whole catalogue
        $perPage = $request->integer('per_page');
        $products = $query->paginate($perPage > 0 ? min($perPage, 48) : 20);

        $products->getCollection()->transform(function ($product) use ($locale) {
            if ($product->category) {
                $product->category->localised_name = $this->localisedCategoryName($product->category, $locale);
            }
            return $product;
        });

        return response()->json($products);
    }

    /**
     * Current price / stock / availability for the products in a cart.
     * The cart keeps whatever price and stock it saw when the item was added,
     * so the cart and checkout pages ask this before showing totals.
     */
    public function cartStatus(Request $request)
    {
        $validated = $request->validate([
            'product_ids'   => 'required|array|min:1|max:50',
            'product_ids.*' => 'integer',
        ]);

        $products = Product::whereIn('id', $validated['product_ids'])
            ->with('seller:id,user_id,status')
            ->get(['id', 'seller_id', 'price', 'stock_quantity', 'is_active', 'is_approved']);

        $userId = $request->user('sanctum')?->id;

        return response()->json([
            'products' => $products->map(fn ($p) => [
                'id'             => $p->id,
                'price'          => (float) $p->price,
                'stock_quantity' => $p->stock_quantity,
                // same rule checkout enforces: active, approved, verified store,
                // and not the customer's own store
                'available'      => $p->is_active
                    && $p->is_approved
                    && $p->seller?->status === 'verified'
                    && $p->seller?->user_id !== $userId,
            ])->values(),
        ]);
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