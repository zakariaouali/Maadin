<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function __construct(private ImageService $images) {}

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id'     => 'sometimes|required|exists:categories,id',
            'name'            => 'sometimes|required|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'description'     => 'sometimes|required|string',
            'price'           => 'sometimes|required|numeric|min:0.01|max:99999.99',
            'stock_quantity'  => 'sometimes|required|integer|min:0',
            'sku'             => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'is_active'       => 'sometimes|boolean',
        ]);

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = $this->generateUniqueSlug($validated['name'], $product->id);
        }

        $product->update($validated);

        AdminAuditLog::create([
            'admin_id'     => $request->user()->id,
            'action'       => 'edit_product',
            'subject_type' => 'product',
            'subject_id'   => $product->id,
            'changes'      => $validated,
            'ip_address'   => $request->ip(),
            'user_agent'   => $request->userAgent(),
        ]);

        return response()->json($product->load('category', 'images', 'seller.user'));
    }

    public function storeImage(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'images'   => 'required|array|max:5',
            'images.*' => 'required|file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
        ]);

        $existingCount = $product->images()->count();

        if ($existingCount + count($request->file('images')) > 10) {
            return response()->json(['message' => 'Maximum 10 images per product.'], 422);
        }

        $uploaded = [];
        foreach ($request->file('images') as $file) {
            $url = $this->images->upload($file, 'products');
            $uploaded[] = ProductImage::create([
                'product_id'    => $product->id,
                'image_path'    => $url,
                'display_order' => $existingCount + count($uploaded),
                'is_primary'    => $existingCount === 0 && count($uploaded) === 0,
            ]);
        }

        return response()->json($uploaded, 201);
    }

    public function setPrimaryImage(string $id, string $imageId)
    {
        $product = Product::findOrFail($id);
        $image   = $product->images()->findOrFail($imageId);

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json($image);
    }

    public function destroyImage(string $id, string $imageId)
    {
        $product = Product::findOrFail($id);
        $image   = $product->images()->findOrFail($imageId);

        $this->images->delete($image->image_path);

        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary) {
            $product->images()->orderBy('display_order')->first()?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Image deleted']);
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug     = Str::slug($name);
        $original = $slug;
        $i        = 1;

        while (Product::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }

    public function index(Request $request)
    {
        $query = Product::with(['seller:id,store_name', 'category:id,name', 'primaryImage:id,product_id,image_path']);

        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        if ($request->filled('is_approved')) {
            $query->where('is_approved', $request->boolean('is_approved'));
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($products);
    }

    public function show(string $id)
    {
        $product = Product::with([
            'seller:id,store_name,store_slug,logo_path,phone_number,rating,total_reviews',
            'seller.user:id,name,email,phone',
            'category:id,name',
            'images',
        ])->findOrFail($id);

        return response()->json($product);
    }

    public function destroy(Request $request, string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'remove_product',
            'subject_type' => 'product',
            'subject_id' => $product->id,
            'changes' => ['name' => $product->name],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Product removed']);
    }

    public function approve(Request $request, string $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_approved' => true, 'is_active' => true]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'approve_product',
            'subject_type' => 'product',
            'subject_id' => $product->id,
            'changes' => ['is_approved' => true],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($product);
    }

    public function reject(Request $request, string $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_approved' => false, 'is_active' => false]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'reject_product',
            'subject_type' => 'product',
            'subject_id' => $product->id,
            'changes' => ['is_approved' => false],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($product);
    }

    public function toggleActive(Request $request, string $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'toggle_product_active',
            'subject_type' => 'product',
            'subject_id' => $product->id,
            'changes' => ['is_active' => $product->is_active],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($product);
    }
}