<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function __construct(private ImageService $images) {}

    public function index()
    {
        $categories = Category::withCount('children as subcategories_count')
            ->orderBy('display_order')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'name_fr'       => 'nullable|string|max:255',
            'name_ar'       => 'nullable|string|max:255',
            'description'   => 'nullable|string',
            'parent_id'     => 'nullable|exists:categories,id',
            'display_order' => 'nullable|integer',
            'is_active'     => 'nullable|boolean',
            'image'         => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp|max:2048',
        ]);

        $validated['slug'] = $this->generateUniqueSlug($validated['name']);

        if ($request->hasFile('image')) {
            $validated['icon_path'] = $this->images->upload($request->file('image'), 'categories');
        }

        unset($validated['image']);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function show(string $id)
    {
        return response()->json(Category::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'name_fr'       => 'nullable|string|max:255',
            'name_ar'       => 'nullable|string|max:255',
            'description'   => 'nullable|string',
            'parent_id'     => 'nullable|exists:categories,id',
            'display_order' => 'nullable|integer',
            'is_active'     => 'nullable|boolean',
            'image'         => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp|max:2048',
        ]);

        if (isset($validated['name']) && $validated['name'] !== $category->name) {
            $validated['slug'] = $this->generateUniqueSlug($validated['name'], $category->id);
        }

        if ($request->hasFile('image')) {
            if ($category->icon_path) {
                $this->images->delete($category->icon_path);
            }
            $validated['icon_path'] = $this->images->upload($request->file('image'), 'categories');
        }

        unset($validated['image']);

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a category that has products assigned to it.',
            ], 422);
        }

        if ($category->icon_path) {
            $this->images->delete($category->icon_path);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;

        while (
            Category::where('slug', $slug)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}
