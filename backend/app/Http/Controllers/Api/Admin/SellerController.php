<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Seller;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    public function index(Request $request)
    {
        $query = Seller::with('user:id,name,email');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sellers = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($sellers);
    }

    public function show(string $id)
    {
        $seller = Seller::with('user:id,name,email,phone')->findOrFail($id);

        return response()->json($seller);
    }

    public function verify(Request $request, string $id)
    {
        $seller = Seller::findOrFail($id);
        $seller->update(['status' => 'verified']);

        $this->logAction($request, 'verify_seller', 'seller', $seller->id, ['status' => 'verified']);

        return response()->json($seller);
    }

    public function suspend(Request $request, string $id)
    {
        $seller = Seller::findOrFail($id);
        $seller->update(['status' => 'suspended']);

        $this->logAction($request, 'suspend_seller', 'seller', $seller->id, ['status' => 'suspended']);

        return response()->json($seller);
    }

    private function logAction(Request $request, string $action, string $subjectType, int $subjectId, array $changes): void
    {
        AdminAuditLog::create([
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