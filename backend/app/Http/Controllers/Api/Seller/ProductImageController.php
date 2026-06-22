<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    public function store(Request $request, string $productId)
    {
        $product = $this->ownedProductOrFail($request, $productId);

        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120', // 5MB max
        ]);

        $existingCount = $product->images()->count();

        if ($existingCount + count($request->file('images')) > 10) {
            return response()->json(['message' => 'Maximum 10 images per product.'], 422);
        }

        $uploaded = [];

        foreach ($request->file('images') as $file) {
            $path = $file->store('products/images', 'public');

            $image = ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'display_order' => $product->images()->count(),
                'is_primary' => $existingCount === 0 && count($uploaded) === 0,
                'file_size' => $file->getSize(),
            ]);

            $uploaded[] = $image;
        }

        return response()->json($uploaded, 201);
    }

    public function setPrimary(Request $request, string $productId, string $imageId)
    {
        $product = $this->ownedProductOrFail($request, $productId);
        $image = $product->images()->findOrFail($imageId);

        // Enforce only one primary image (app-level, since MariaDB can't do partial unique index)
        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json($image);
    }

    public function destroy(Request $request, string $productId, string $imageId)
    {
        $product = $this->ownedProductOrFail($request, $productId);
        $image = $product->images()->findOrFail($imageId);

        Storage::disk('public')->delete($image->image_path);
        $wasPrimary = $image->is_primary;
        $image->delete();

        // If we deleted the primary image, promote the next one
        if ($wasPrimary) {
            $next = $product->images()->orderBy('display_order')->first();
            $next?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Image deleted']);
    }

    private function ownedProductOrFail(Request $request, string $productId): Product
    {
        $seller = $request->user()->seller;

        abort_if(!$seller, 404, 'No store found for this account.');

        return $seller->products()->findOrFail($productId);
    }
}