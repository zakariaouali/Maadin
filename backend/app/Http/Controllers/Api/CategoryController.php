<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $locale = in_array($request->query('locale'), ['fr', 'ar']) ? $request->query('locale') : 'en';

        $categories = Category::active()
            ->whereNull('parent_id')
            ->with(['children' => fn($q) => $q->active()->orderBy('display_order')])
            ->orderBy('display_order')
            ->get()
            ->map(fn($cat) => $this->localise($cat, $locale));

        return response()->json($categories);
    }

    private function localise(Category $cat, string $locale): array
    {
        $name = match($locale) {
            'fr'    => $cat->name_fr ?? $cat->name,
            'ar'    => $cat->name_ar ?? $cat->name,
            default => $cat->name,
        };

        $result = array_merge($cat->toArray(), ['localised_name' => $name]);

        if ($cat->relationLoaded('children')) {
            $result['children'] = $cat->children->map(fn($c) => $this->localise($c, $locale))->values()->toArray();
        }

        return $result;
    }
}