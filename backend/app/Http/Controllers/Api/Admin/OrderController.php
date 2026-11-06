<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\NewMessageMail;
use App\Models\AdminAuditLog;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Order;
use App\Services\OrderStatusService;
use App\Support\NotificationMessages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    /** Plans whose orders the team handles for the store */
    private const MANAGED_PLANS = ['managed', 'premium'];

    public function index(Request $request)
    {
        $query = Order::with(['customer:id,name,email', 'seller:id,user_id,store_name', 'seller.user:id,plan']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->boolean('on_hold')) {
            $query->where('on_hold', true);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);
        $orders->getCollection()->each(fn (Order $o) => $o->setAttribute('is_managed', $this->isManaged($o)));

        return response()->json($orders);
    }

    public function show(string $id)
    {
        $order = Order::with([
            'customer:id,name,email,phone',
            'seller:id,user_id,store_name',
            'seller.user:id,plan',
            'items.product:id,slug',
        ])->findOrFail($id);

        $order->setAttribute('is_managed', $this->isManaged($order));
        $order->setAttribute('timeline', $this->timeline($order));

        return response()->json($order);
    }

    public function updateStatus(Request $request, string $id, OrderStatusService $statuses)
    {
        $order = $this->managedOrderOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:confirmed,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $from = $order->status;
        $order = $statuses->change($order, $validated['status'], $validated['tracking_number'] ?? null);

        $this->log($request, 'order_status_changed', $order, [
            'from' => $from,
            'to' => $order->status,
            'tracking_number' => $validated['tracking_number'] ?? null,
        ]);

        return $this->show((string) $order->id);
    }

    public function hold(Request $request, string $id, OrderStatusService $statuses)
    {
        $order = $this->managedOrderOrFail($id);

        $validated = $request->validate([
            'on_hold' => 'required|boolean',
            'reason' => 'nullable|string|max:255',
        ]);

        $order = $statuses->setHold($order, (bool) $validated['on_hold'], $validated['reason'] ?? null);

        $this->log($request, $order->on_hold ? 'order_put_on_hold' : 'order_hold_released', $order, [
            'reason' => $validated['reason'] ?? null,
        ]);

        return $this->show((string) $order->id);
    }

    /** Write to the customer as the store, inside the normal conversation. */
    public function message(Request $request, string $id)
    {
        $order = $this->managedOrderOrFail($id);
        $validated = $request->validate(['content' => 'required|string|max:2000']);

        $customer = $order->customer;
        $storeUser = $order->seller->user;
        abort_if(!$customer, 422, __('The customer account no longer exists.'));

        $conversation = Conversation::firstOrCreate(
            ['buyer_id' => $customer->id, 'seller_id' => $storeUser->id],
            ['order_id' => $order->id]
        );
        if (empty($conversation->order_id)) {
            $conversation->update(['order_id' => $order->id]);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $storeUser->id,
            'receiver_id' => $customer->id,
            'content' => $validated['content'],
        ]);
        $conversation->update(['last_message_at' => now()]);

        $locale = $customer->locale ?? 'en';
        $preview = mb_substr(strip_tags($validated['content']), 0, 100);
        $storeName = $order->seller->store_name;
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

        $this->log($request, 'order_message_sent', $order, ['excerpt' => mb_substr($validated['content'], 0, 120)]);

        return response()->json(['message' => $message, 'conversation_id' => $conversation->id], 201);
    }

    private function managedOrderOrFail(string $id): Order
    {
        $order = Order::with(['seller.user', 'customer'])->findOrFail($id);
        abort_if(!$this->isManaged($order), 403, __('This store manages its own orders.'));

        return $order;
    }

    private function isManaged(Order $order): bool
    {
        return in_array($order->seller?->user?->plan, self::MANAGED_PLANS, true);
    }

    /** What the team did on this order, newest first (from the audit log). */
    private function timeline(Order $order): array
    {
        return AdminAuditLog::with('admin:id,name')
            ->where('subject_type', 'order')
            ->where('subject_id', $order->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn (AdminAuditLog $l) => [
                'id' => $l->id,
                'action' => $l->action,
                'admin' => $l->admin?->name,
                'changes' => $l->changes,
                'at' => $l->created_at?->toIso8601String(),
            ])
            ->all();
    }

    private function log(Request $request, string $action, Order $order, array $changes): void
    {
        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => $action,
            'subject_type' => 'order',
            'subject_id' => $order->id,
            'changes' => $changes,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
