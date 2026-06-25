<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['seller:id,store_name', 'category:id,name']);

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