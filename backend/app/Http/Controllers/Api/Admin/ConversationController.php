<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Conversation;
use App\Services\StoreMessenger;
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
        $conversation = Conversation::with(['buyer:id,name,email', 'seller:id,name,email,plan', 'seller.seller:id,user_id,store_name', 'messages'])
            ->findOrFail($id);

        // The team can answer as the store only when it runs the store
        $conversation->setAttribute('can_reply', StoreMessenger::isManaged($conversation->seller));
        $conversation->setAttribute('store_name', $conversation->seller?->seller?->store_name);

        return response()->json($conversation);
    }

    /** Answer the customer as the store (admin-managed stores only). */
    public function reply(Request $request, string $id, StoreMessenger $messenger)
    {
        $conversation = Conversation::with(['buyer', 'seller.seller'])->findOrFail($id);
        abort_if(!StoreMessenger::isManaged($conversation->seller), 403, __('This store manages its own orders.'));
        abort_if(!$conversation->buyer, 422, __('The customer account no longer exists.'));

        $validated = $request->validate(['content' => 'required|string|max:2000']);

        [$message] = $messenger->send(
            $conversation->seller,
            $conversation->seller->seller?->store_name ?? $conversation->seller->name,
            $conversation->buyer,
            $validated['content'],
        );

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'conversation_reply_sent',
            'subject_type' => 'conversation',
            'subject_id' => $conversation->id,
            'changes' => ['excerpt' => mb_substr($validated['content'], 0, 120)],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => $message, 'conversation_id' => $conversation->id], 201);
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

        return response()->json(['message' => __('Conversation removed')]);
    }
}