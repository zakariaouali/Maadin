<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Quick suggest — called on every keystroke (debounced on frontend).
     * Returns top 5 products + top 3 stores. No pagination.
     */
    public function suggest(Request $request)
    {
        $q = trim($request->get('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json(['products' => [], 'stores' => []]);
        }

        $like = "%{$q}%";

        $products = Product::active()
            ->whereHas('seller', fn($sq) => $sq->where('status', 'verified'))
            ->with(['primaryImage:id,product_id,image_path', 'seller:id,store_name,store_slug'])
            ->where(fn($sq) => $sq->where('name', 'LIKE', $like)->orWhere('short_description', 'LIKE', $like))
            ->orderByRaw("CASE WHEN name LIKE ? THEN 0 ELSE 1 END", [$like])
            ->limit(5)
            ->get(['id', 'name', 'slug', 'price', 'seller_id']);

        $stores = Seller::where('status', 'verified')
            ->where(fn($sq) => $sq->where('store_name', 'LIKE', $like)->orWhere('store_description', 'LIKE', $like))
            ->limit(3)
            ->get(['id', 'store_name', 'store_slug', 'logo_path']);

        return response()->json([
            'products' => $products,
            'stores'   => $stores,
        ]);
    }

    /**
     * Full search — paginated results for the /search page.
     */
    public function index(Request $request)
    {
        $q    = trim($request->get('q', ''));
        $type = $request->get('type', 'all'); // all | products | stores

        if (mb_strlen($q) < 2) {
            return response()->json(['query' => $q, 'products' => null, 'stores' => [], 'total_products' => 0, 'total_stores' => 0]);
        }

        $like = "%{$q}%";

        // ── Products ─────────────────────────────────────────────────────────
        $products = null;
        $totalProducts = 0;

        if ($type !== 'stores') {
            $pq = Product::active()
                ->whereHas('seller', fn($sq) => $sq->where('status', 'verified'))
                ->with(['primaryImage:id,product_id,image_path', 'seller:id,store_name,store_slug,logo_path', 'category:id,name'])
                ->where(fn($sq) => $sq
                    ->where('name', 'LIKE', $like)
                    ->orWhere('short_description', 'LIKE', $like)
                    ->orWhereFullText(['name', 'description', 'short_description'], $q)
                );

            if ($request->filled('category_id')) {
                $pq->where('category_id', $request->category_id);
            }
            if ($request->filled('min_price')) {
                $pq->where('price', '>=', $request->min_price);
            }
            if ($request->filled('max_price')) {
                $pq->where('price', '<=', $request->max_price);
            }

            $sort = $request->get('sort', 'relevance');
            match ($sort) {
                'price_low'  => $pq->orderBy('price', 'asc'),
                'price_high' => $pq->orderBy('price', 'desc'),
                'popular'    => $pq->orderBy('total_sales', 'desc'),
                'rating'     => $pq->orderBy('rating', 'desc'),
                // relevance: exact name match first, then by sales
                default      => $pq->orderByRaw("CASE WHEN name LIKE ? THEN 0 ELSE 1 END, total_sales DESC", [$like]),
            };

            $paginated    = $pq->paginate(20);
            $products     = $paginated;
            $totalProducts = $paginated->total();
        }

        // ── Stores ───────────────────────────────────────────────────────────
        $stores      = collect();
        $totalStores = 0;

        if ($type !== 'products') {
            $stores = Seller::where('status', 'verified')
                ->where(fn($sq) => $sq->where('store_name', 'LIKE', $like)->orWhere('store_description', 'LIKE', $like))
                ->withCount('products')
                ->get(['id', 'store_name', 'store_slug', 'logo_path', 'banner_path', 'store_description', 'rating', 'total_reviews', 'level']);

            $totalStores = $stores->count();
        }

        return response()->json([
            'query'          => $q,
            'total_products' => $totalProducts,
            'total_stores'   => $totalStores,
            'products'       => $products,
            'stores'         => $stores,
        ]);
    }
}
