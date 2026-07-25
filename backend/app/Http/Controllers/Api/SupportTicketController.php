<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    // ── Submit a new ticket (guests or authenticated users) ──────────────────
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'guest_name'  => $user ? 'nullable' : 'required|string|max:100',
            'guest_email' => $user ? 'nullable' : 'required|email|max:255',
            'category'    => 'required|in:order,account,billing,technical,report,other',
            'subject'     => 'required|string|max:255',
            'message'     => 'required|string|min:10|max:5000',
        ]);

        $ticket = SupportTicket::create([
            'user_id'     => $user?->id,
            'guest_name'  => $user ? null : $validated['guest_name'],
            'guest_email' => $user ? null : $validated['guest_email'],
            'role'        => $user ? $user->role : 'guest',
            'category'    => $validated['category'],
            'subject'     => $validated['subject'],
            'message'     => $validated['message'],
        ]);

        // Notify the user if authenticated
        if ($user) {
            Notification::send(
                $user->id,
                'support',
                'Support ticket received',
                "We received your request: \"{$ticket->subject}\". We'll get back to you soon.",
                '/support'
            );
        }

        return response()->json($ticket->load('user:id,name,email'), 201);
    }

    // ── List own tickets ─────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $user = Auth::user();

        $tickets = SupportTicket::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get(['id', 'category', 'subject', 'status', 'priority', 'admin_reply', 'replied_at', 'user_read_at', 'created_at']);

        return response()->json($tickets);
    }

    // ── View single ticket (marks reply as read) ─────────────────────────────
    public function show(Request $request, string $id)
    {
        $user = Auth::user();

        $ticket = SupportTicket::where('user_id', $user->id)->findOrFail($id);

        // Mark reply as seen when user views the ticket
        if ($ticket->admin_reply && !$ticket->user_read_at) {
            $ticket->update(['user_read_at' => now()]);
        }

        return response()->json($ticket);
    }

    // ── Count unread replies for badge ───────────────────────────────────────
    public function unreadCount(Request $request)
    {
        $count = SupportTicket::where('user_id', Auth::id())
            ->whereNotNull('admin_reply')
            ->whereNull('user_read_at')
            ->count();

        return response()->json(['count' => $count]);
    }
}
