<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageService;
use Illuminate\Http\Request;

class ProductImageController extends Controller
{
    public function __construct(private ImageService $images) {}

    public function store(Request $request, string $productId)
    {
        $product = $this->ownedProductOrFail($request, $productId);

        $request->validate([
            'images'   => 'required|array|max:5',
            'images.*' => 'required|file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
        ]);

        $existingCount = $product->images()->count();

        if ($existingCount + count($request->file('images')) > 5) {
            return response()->json(['message' => 'Maximum 5 images per product.'], 422);
        }

        $uploaded = [];

        foreach ($request->file('images') as $file) {
            $url = $this->images->upload($file, 'products');

            $image = ProductImage::create([
                'product_id'    => $product->id,
                'image_path'    => $url,
                'display_order' => $existingCount + count($uploaded),
                'is_primary'    => $existingCount === 0 && count($uploaded) === 0,
            ]);

            $uploaded[] = $image;
        }

        return response()->json($uploaded, 201);
    }

    public function setPrimary(Request $request, string $productId, string $imageId)
    {
        $product = $this->ownedProductOrFail($request, $productId);
        $image   = $product->images()->findOrFail($imageId);

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json($image);
    }

    public function destroy(Request $request, string $productId, string $imageId)
    {
        $product = $this->ownedProductOrFail($request, $productId);
        $image   = $product->images()->findOrFail($imageId);

        $this->images->delete($image->image_path);

        $wasPrimary = $image->is_primary;
        $image->delete();

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
