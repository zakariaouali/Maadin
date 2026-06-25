<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** List recent notifications for the authenticated user. */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        $unread = $notifications->whereNull('read_at')->count();

        return response()->json([
            'unread'        => $unread,
            'notifications' => $notifications,
        ]);
    }

    /** Mark a single notification as read. */
    public function markRead(Request $request, string $id)
    {
        Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    /** Mark all notifications as read. */
    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
