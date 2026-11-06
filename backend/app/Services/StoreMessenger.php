<?php

namespace App\Services;

use App\Mail\NewMessageMail;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use App\Support\NotificationMessages;
use Illuminate\Support\Facades\Mail;

/**
 * Lets the team write to a customer as the store (for admin-managed stores, whose store
 * account nobody logs into). The customer sees the store replying in the normal conversation.
 */
class StoreMessenger
{
    /** Plans whose stores the team runs */
    public const MANAGED_PLANS = ['managed', 'premium'];

    public static function isManaged(?User $storeUser): bool
    {
        return $storeUser !== null && in_array($storeUser->plan, self::MANAGED_PLANS, true);
    }

    /** @return array{0: Message, 1: Conversation} */
    public function send(User $storeUser, string $storeName, User $customer, string $content, ?int $orderId = null): array
    {
        $conversation = Conversation::firstOrCreate(
            ['buyer_id' => $customer->id, 'seller_id' => $storeUser->id],
            ['order_id' => $orderId]
        );
        if ($orderId !== null && empty($conversation->order_id)) {
            $conversation->update(['order_id' => $orderId]);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $storeUser->id,
            'receiver_id' => $customer->id,
            'content' => $content,
        ]);
        $conversation->update(['last_message_at' => now()]);

        // The team answered, so what the customer wrote to the store counts as read
        Message::where('conversation_id', $conversation->id)
            ->where('receiver_id', $storeUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        $locale = $customer->locale ?? 'en';
        $preview = mb_substr(strip_tags($content), 0, 100);
        [$title, $body] = NotificationMessages::get('message.received', $locale, ['sender' => $storeName, 'preview' => $preview]);
        Notification::create([
            'user_id' => $customer->id,
            'type' => 'message',
            'title' => $title,
            'body' => $body,
            'link' => "/messages/{$conversation->id}",
            'data' => ['conversation_id' => $conversation->id, 'sender_id' => $storeUser->id],
        ]);
        Mail::to($customer->email)->send(new NewMessageMail($storeName, $preview, $conversation->id, $locale));

        return [$message, $conversation];
    }
}
