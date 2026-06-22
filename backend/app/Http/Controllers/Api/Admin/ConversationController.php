<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $query = Conversation::with(['buyer:id,name', 'seller:id,name']);

        if ($request->boolean('flagged_only')) {
            $query->whereHas('messages', fn($q) => $q->where('has_blocked_content', true));
        }

        $conversations = $query->orderBy('last_message_at', 'desc')->paginate(20);

        return response()->json($conversations);
    }

    public function show(string $id)
    {
        $conversation = Conversation::with(['buyer:id,name,email', 'seller:id,name,email', 'messages'])
            ->findOrFail($id);

        return response()->json($conversation);
    }

    public function destroy(Request $request, string $id)
    {
        $conversation = Conversation::findOrFail($id);
        $conversation->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'remove_conversation',
            'subject_type' => 'conversation',
            'subject_id' => $conversation->id,
            'changes' => [],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Conversation removed']);
    }
}