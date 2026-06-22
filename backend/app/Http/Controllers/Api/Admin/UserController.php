<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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
        $user = User::with('seller')->findOrFail($id);

        return response()->json($user);
    }

    public function updateStatus(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,suspended,banned',
        ]);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot change status of another admin.'], 403);
        }

        $user->update(['status' => $validated['status']]);

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