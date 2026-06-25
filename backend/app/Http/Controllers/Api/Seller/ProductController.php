<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // List the logged-in seller's own products
    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'No store found for this account.'], 404);
        }

        $products = $seller->products()
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $seller = $request->user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'You must create a store before adding products.'], 422);
        }

        if ($seller->status !== 'verified') {
            return response()->json(['message' => 'Your store must be verified before you can list products.'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0.01|max:99999.99',
            'stock_quantity' => 'required|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
        ]);

        $validated['seller_id']  = $seller->id;
        $validated['slug']       = $this->generateUniqueSlug($validated['name']);
        $validated['is_approved'] = false; // requires admin review before going live

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function show(Request $request, string $id)
    {
        $product = $this->ownedProductOrFail($request, $id);

        return response()->json($product->load('category', 'images'));
    }

    public function update(Request $request, string $id)
    {
        $product = $this->ownedProductOrFail($request, $id);

        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0.01|max:99999.99',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = $this->generateUniqueSlug($validated['name'], $product->id);
        }

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy(Request $request, string $id)
    {
        $product = $this->ownedProductOrFail($request, $id);
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }

    private function ownedProductOrFail(Request $request, string $id): Product
    {
        $seller = $request->user()->seller;

        abort_if(!$seller, 404, 'No store found for this account.');

        return $seller->products()->findOrFail($id);
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;

        while (Product::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}