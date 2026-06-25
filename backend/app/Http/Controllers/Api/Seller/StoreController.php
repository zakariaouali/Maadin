<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    public function __construct(private ImageService $images) {}

    public function show(Request $request)
    {
        $seller = $request->user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'No store found for this account.'], 404);
        }

        return response()->json($seller);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (in_array($user->plan, ['managed', 'premium'])) {
            return response()->json(['message' => 'Your store is created and managed by our team. Please contact us.'], 403);
        }

        if ($user->seller) {
            return response()->json(['message' => 'Store already exists for this account.'], 422);
        }

        $validated = $request->validate([
            'store_name'          => 'required|string|min:3|max:100',
            'store_description'   => 'nullable|string',
            'seller_bio'          => 'nullable|string|max:1000',
            'phone_number'        => 'required|string|max:20',
            'bank_account_number' => 'nullable|string',
            'bank_name'           => 'nullable|string',
            'logo'                => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp|max:2048',
            'banner'              => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
            'shop_photo'          => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
            'portfolio'           => 'nullable|array|max:4',
            'portfolio.*'         => 'file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
        ]);

        $data = [
            'user_id'             => $user->id,
            'store_name'          => $validated['store_name'],
            'store_description'   => $validated['store_description'] ?? null,
            'seller_bio'          => $validated['seller_bio'] ?? null,
            'phone_number'        => $validated['phone_number'],
            'bank_account_number' => $validated['bank_account_number'] ?? null,
            'bank_name'           => $validated['bank_name'] ?? null,
            'store_slug'          => $this->generateUniqueSlug($validated['store_name']),
        ];

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $this->images->upload($request->file('logo'), 'stores/logos');
        }

        if ($request->hasFile('banner')) {
            $data['banner_path'] = $this->images->upload($request->file('banner'), 'stores/banners');
        }

        if ($request->hasFile('shop_photo')) {
            $data['shop_photo_path'] = $this->images->upload($request->file('shop_photo'), 'stores/shop_photos');
        }

        if ($request->hasFile('portfolio')) {
            $data['portfolio_paths'] = collect($request->file('portfolio'))
                ->map(fn ($f) => $this->images->upload($f, 'stores/portfolio'))
                ->values()->toArray();
        }

        $seller = Seller::create($data);

        return response()->json($seller, 201);
    }

    public function update(Request $request)
    {
        $seller = $request->user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'No store found for this account.'], 404);
        }

        $validated = $request->validate([
            'store_name'          => 'sometimes|required|string|min:3|max:100',
            'store_description'   => 'nullable|string',
            'seller_bio'          => 'nullable|string|max:1000',
            'phone_number'        => 'sometimes|required|string|max:20',
            'bank_account_number' => 'nullable|string',
            'bank_name'           => 'nullable|string',
            'logo'                => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp|max:2048',
            'banner'              => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
            'shop_photo'          => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
            'portfolio'           => 'nullable|array|max:4',
            'portfolio.*'         => 'file|mimetypes:image/jpeg,image/png,image/webp|max:5120',
        ]);

        $data = collect($validated)->except(['logo', 'banner', 'shop_photo', 'portfolio'])->toArray();

        if (isset($data['store_name']) && $data['store_name'] !== $seller->store_name) {
            $data['store_slug'] = $this->generateUniqueSlug($data['store_name'], $seller->id);
        }

        if ($request->hasFile('logo')) {
            $this->images->delete($seller->logo_path);
            $data['logo_path'] = $this->images->upload($request->file('logo'), 'stores/logos');
        }

        if ($request->hasFile('banner')) {
            $this->images->delete($seller->banner_path);
            $data['banner_path'] = $this->images->upload($request->file('banner'), 'stores/banners');
        }

        if ($request->hasFile('shop_photo')) {
            $this->images->delete($seller->shop_photo_path);
            $data['shop_photo_path'] = $this->images->upload($request->file('shop_photo'), 'stores/shop_photos');
        }

        if ($request->hasFile('portfolio')) {
            foreach ((array) ($seller->portfolio_paths ?? []) as $old) {
                $this->images->delete($old);
            }
            $data['portfolio_paths'] = collect($request->file('portfolio'))
                ->map(fn ($f) => $this->images->upload($f, 'stores/portfolio'))
                ->values()->toArray();
        }

        $seller->update($data);

        return response()->json($seller);
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug     = Str::slug($name);
        $original = $slug;
        $i        = 1;

        while (
            Seller::where('store_slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}
