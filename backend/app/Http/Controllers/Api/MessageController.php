<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\ContentFilterService;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(private ContentFilterService $contentFilter) {}

    // List all conversations for the logged-in user (as buyer or seller)
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Conversation::where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->with(['buyer:id,name', 'seller:id,name', 'product:id,name,slug'])
            ->withCount(['messages as unread_count' => function ($q) use ($userId) {
                $q->where('receiver_id', $userId)->where('is_read', false);
            }])
            ->orderBy('last_message_at', 'desc')
            ->get();

        return response()->json($conversations);
    }

    // Get messages within a conversation (and mark as read)
    public function show(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $conversation = Conversation::where(function ($q) use ($userId) {
            $q->where('buyer_id', $userId)->orWhere('seller_id', $userId);
        })->findOrFail($id);

        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get();

        // Mark messages addressed to me as read
        $conversation->messages()
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json([
            'conversation' => $conversation->load('buyer:id,name', 'seller:id,name', 'product:id,name,slug'),
            'messages' => $messages,
        ]);
    }

    // Start (or reuse) a conversation and send the first/next message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required_without:conversation_id|exists:users,id',
            'conversation_id' => 'required_without:receiver_id|exists:conversations,id',
            'product_id' => 'nullable|exists:products,id',
            'content' => 'required|string|max:10000',
        ]);

        $sender = $request->user();

        if (!empty($validated['conversation_id'])) {
            $conversation = Conversation::where(function ($q) use ($sender) {
                $q->where('buyer_id', $sender->id)->orWhere('seller_id', $sender->id);
            })->findOrFail($validated['conversation_id']);

            $receiverId = $conversation->buyer_id === $sender->id
                ? $conversation->seller_id
                : $conversation->buyer_id;
        } else {
            $receiver = User::findOrFail($validated['receiver_id']);

            if ($receiver->id === $sender->id) {
                return response()->json(['message' => 'You cannot message yourself.'], 422);
            }

            // Determine buyer/seller roles for the conversation record
            $buyerId = $sender->role === 'seller' && $receiver->role !== 'seller' ? $receiver->id : $sender->id;
            $sellerId = $buyerId === $sender->id ? $receiver->id : $sender->id;

            $conversation = Conversation::firstOrCreate(
                ['buyer_id' => $buyerId, 'seller_id' => $sellerId],
                ['product_id' => $validated['product_id'] ?? null]
            );

            if (empty($conversation->product_id) && !empty($validated['product_id'])) {
                $conversation->update(['product_id' => $validated['product_id']]);
            }

            $receiverId = $receiver->id;
        }

        $filtered = $this->contentFilter->filter($validated['content']);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'receiver_id' => $receiverId,
            'content' => $filtered['content'],
            'has_blocked_content' => $filtered['has_blocked_content'],
            'blocked_patterns' => $filtered['blocked_patterns'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'message' => $message,
            'conversation_id' => $conversation->id,
            'warning' => $filtered['has_blocked_content']
                ? 'Sharing contact information is not allowed. The relevant part of your message was hidden.'
                : null,
        ], 201);
    }
}