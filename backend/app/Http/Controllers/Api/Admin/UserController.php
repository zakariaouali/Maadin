<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    public function show(string $id)
    {
        $user = User::with('seller:id,user_id,store_name,store_slug,status,rating,total_orders')->findOrFail($id);
        $seller = $user->seller;

        $data = $user->toArray();
        $data['stats'] = [
            'orders_count' => $user->orders()->count(),
            'delivered_total' => (float) $user->orders()->where('status', 'delivered')->sum('total_price'),
            'reviews_count' => $user->reviews()->count(),
            'addresses_count' => $user->addresses()->count(),
            'products_count' => $seller ? Product::where('seller_id', $seller->id)->count() : 0,
            'store_orders_count' => $seller ? Order::where('seller_id', $seller->id)->count() : 0,
        ];
        $data['recent_orders'] = $user->orders()->latest('id')->limit(10)
            ->get(['id', 'order_number', 'status', 'on_hold', 'total_price', 'created_at']);
        // What the team did to this account (suspensions, plan changes...)
        $data['history'] = AdminAuditLog::with('admin:id,name')
            ->where('subject_type', 'user')->where('subject_id', $user->id)
            ->orderByDesc('id')->limit(20)->get()
            ->map(fn (AdminAuditLog $l) => [
                'id' => $l->id, 'action' => $l->action, 'admin' => $l->admin?->name,
                'changes' => $l->changes, 'at' => $l->created_at?->toIso8601String(),
            ]);

        return response()->json($data);
    }

    public function updateStatus(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,suspended,banned',
        ]);

        if ($user->role === 'admin') {
            return response()->json(['message' => __('Cannot change status of another admin.')], 403);
        }

        $user->update(['status' => $validated['status']]);

        // A suspended/banned seller's store must stop selling too. Coming back
        // to "active" does NOT reopen the store: an admin does that explicitly
        // with "reactivate seller", so a store suspended for its own reasons
        // is never reopened by accident.
        if ($validated['status'] !== 'active' && $user->seller && $user->seller->status !== 'suspended') {
            $user->seller->update(['status' => 'suspended']);
        }

        $this->logAction($request, 'update_user_status', 'user', $user->id, ['status' => $validated['status']]);

        return response()->json($user);
    }

    private function logAction(Request $request, string $action, string $subjectType, int $subjectId, array $changes): void
    {
        \App\Models\AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'changes' => $changes,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}