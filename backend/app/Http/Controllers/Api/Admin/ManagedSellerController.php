<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Seller;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ManagedSellerController extends Controller
{
    public function __construct(protected ImageService $images) {}

    // ── List (sidebar data — lightweight) ────────────────────────────────────
    public function index()
    {
        $users = User::where('role', 'seller')
            ->whereIn('plan', ['managed', 'premium'])
            ->with(['seller:id,user_id,store_name,store_slug,logo_path,status'])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'plan', 'subscription_expires_at', 'monthly_fee']);

        return response()->json($users);
    }

    // ── Full account detail ──────────────────────────────────────────────────
    public function show(string $userId)
    {
        $user = User::where('role', 'seller')
            ->whereIn('plan', ['managed', 'premium'])
            ->findOrFail($userId);

        $seller = $user->seller;

        $data = [
            'user'   => $user,
            'seller' => $seller ? $seller->loadCount(['products', 'orders']) : null,
        ];

        if ($seller) {
            $data['orders'] = Order::where('seller_id', $seller->id)
                ->with('customer:id,name')
                ->orderByDesc('created_at')
                ->get(['id', 'customer_id', 'status', 'total_price', 'created_at']);

            $data['products'] = Product::where('seller_id', $seller->id)
                ->with('primaryImage')
                ->orderByDesc('created_at')
                ->get(['id', 'name', 'price', 'is_active', 'is_approved', 'stock_quantity', 'created_at']);

            $data['conversations'] = Conversation::where('seller_id', $seller->id)
                ->with(['buyer:id,name,avatar_path', 'product:id,name'])
                ->withCount(['messages as unread_count' => fn($q) => $q->where('is_read', false)])
                ->orderByDesc('last_message_at')
                ->get();
        }

        return response()->json($data);
    }

    // ── Update subscription ──────────────────────────────────────────────────
    public function updateSubscription(Request $request, string $userId)
    {
        $user = User::findOrFail($userId);

        $validated = $request->validate([
            'subscription_expires_at' => 'required|date|after:today',
            'monthly_fee'             => 'nullable|numeric|min:0',
        ]);

        $user->update($validated);

        // Reactivate store if it was suspended due to expired subscription
        if ($user->seller && $user->seller->status === 'suspended_subscription') {
            $user->seller->update(['status' => 'verified']);
        }

        return response()->json($user->fresh());
    }

    // ── Admin creates store for managed/premium seller ───────────────────────
    public function createStore(Request $request, string $userId)
    {
        $user = User::where('role', 'seller')->whereIn('plan', ['managed', 'premium'])->findOrFail($userId);

        if ($user->seller) {
            return response()->json(['message' => 'This seller already has a store.'], 422);
        }

        $validated = $request->validate([
            'store_name'          => 'required|string|max:255|unique:sellers,store_name',
            'store_description'   => 'nullable|string|max:2000',
            'phone_number'        => 'nullable|string|max:30',
            'bank_name'           => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:100',
            'logo'                => 'nullable|image|max:4096',
            'banner'              => 'nullable|image|max:6144',
        ]);

        $logoPath = $bannerPath = null;
        if ($request->hasFile('logo'))   $logoPath   = $this->images->upload($request->file('logo'),   'stores/logos');
        if ($request->hasFile('banner')) $bannerPath = $this->images->upload($request->file('banner'), 'stores/banners');

        $seller = Seller::create([
            'user_id'             => $user->id,
            'store_name'          => $validated['store_name'],
            'store_slug'          => $this->uniqueSlug($validated['store_name']),
            'store_description'   => $validated['store_description'] ?? null,
            'phone_number'        => $validated['phone_number'] ?? null,
            'bank_name'           => $validated['bank_name'] ?? null,
            'bank_account_number' => $validated['bank_account_number'] ?? null,
            'logo_path'           => $logoPath,
            'banner_path'         => $bannerPath,
            'status'              => 'verified',
        ]);

        return response()->json($seller, 201);
    }

    // ── Admin updates managed/premium seller's store ─────────────────────────
    public function updateStore(Request $request, string $userId)
    {
        $user   = User::findOrFail($userId);
        $seller = $user->seller ?? abort(404, 'No store found.');

        $validated = $request->validate([
            'store_name'          => 'sometimes|required|string|max:255|unique:sellers,store_name,' . $seller->id,
            'store_description'   => 'nullable|string|max:2000',
            'phone_number'        => 'nullable|string|max:30',
            'bank_name'           => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:100',
            'logo'                => 'nullable|image|max:4096',
            'banner'              => 'nullable|image|max:6144',
        ]);

        if ($request->hasFile('logo')) {
            if ($seller->logo_path) $this->images->delete($seller->logo_path);
            $validated['logo_path'] = $this->images->upload($request->file('logo'), 'stores/logos');
        }
        if ($request->hasFile('banner')) {
            if ($seller->banner_path) $this->images->delete($seller->banner_path);
            $validated['banner_path'] = $this->images->upload($request->file('banner'), 'stores/banners');
        }
        if (isset($validated['store_name'])) {
            $validated['store_slug'] = $this->uniqueSlug($validated['store_name'], $seller->id);
        }

        unset($validated['logo'], $validated['banner']);
        $seller->update($validated);

        return response()->json($seller->fresh());
    }

    // ── Admin adds product for premium seller ────────────────────────────────
    public function createProduct(Request $request, string $userId)
    {
        $user   = User::findOrFail($userId);
        $seller = $user->seller ?? abort(404, 'Create a store first.');

        if ($user->plan !== 'premium') {
            return response()->json(['message' => 'Only premium sellers have products managed by admin.'], 403);
        }

        $validated = $request->validate([
            'category_id'    => 'required|exists:categories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0.01|max:99999.99',
            'stock_quantity' => 'required|integer|min:0',
            'sku'            => 'nullable|string|max:100|unique:products,sku',
            'images'         => 'nullable|array|max:5',
            'images.*'       => 'file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
        ]);

        $validated['seller_id']   = $seller->id;
        $validated['slug']        = $this->uniqueProductSlug($validated['name']);
        $validated['is_approved'] = true;

        $product = Product::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $url = $this->images->upload($file, 'products');
                ProductImage::create(['product_id' => $product->id, 'image_path' => $url, 'display_order' => $i, 'is_primary' => $i === 0]);
            }
        }

        return response()->json($product->load('images'), 201);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name); $orig = $slug; $i = 1;
        while (Seller::where('store_slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$orig}-{$i}"; $i++;
        }
        return $slug;
    }

    private function uniqueProductSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name); $orig = $slug; $i = 1;
        while (Product::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$orig}-{$i}"; $i++;
        }
        return $slug;
    }
}
