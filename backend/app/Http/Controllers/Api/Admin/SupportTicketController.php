<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    // ── List all tickets with filters ────────────────────────────────────────
    public function index(Request $request)
    {
        $q = SupportTicket::with('user:id,name,email,role')
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $q->where('category', $request->category);
        }
        if ($request->filled('priority')) {
            $q->where('priority', $request->priority);
        }
        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $q->where(fn($sq) => $sq
                ->where('subject', 'LIKE', $s)
                ->orWhere('message', 'LIKE', $s)
                ->orWhereHas('user', fn($uq) => $uq->where('name', 'LIKE', $s)->orWhere('email', 'LIKE', $s))
                ->orWhere('guest_name', 'LIKE', $s)
                ->orWhere('guest_email', 'LIKE', $s)
            );
        }

        return response()->json($q->paginate(25));
    }

    // ── View single ticket ───────────────────────────────────────────────────
    public function show(string $id)
    {
        $ticket = SupportTicket::with(['user:id,name,email,role', 'repliedBy:id,name'])->findOrFail($id);
        return response()->json($ticket);
    }

    // ── Update status / priority / notes / reply ─────────────────────────────
    public function update(Request $request, string $id)
    {
        $ticket = SupportTicket::findOrFail($id);

        $validated = $request->validate([
            'status'      => 'sometimes|in:open,in_progress,resolved,closed',
            'priority'    => 'sometimes|in:low,normal,high',
            'admin_notes' => 'sometimes|nullable|string|max:2000',
            'admin_reply' => 'sometimes|nullable|string|max:5000',
        ]);

        if (isset($validated['admin_reply']) && $validated['admin_reply'] && !$ticket->replied_at) {
            $validated['replied_by'] = Auth::id();
            $validated['replied_at'] = now();
        }

        $ticket->update($validated);

        // Notify user if a reply was added
        if (isset($validated['admin_reply']) && $validated['admin_reply'] && $ticket->user_id) {
            Notification::send(
                $ticket->user_id,
                'support',
                'Support ticket update',
                "We replied to your request: \"{$ticket->subject}\".",
                '/support'
            );
        }

        return response()->json($ticket->fresh()->load(['user:id,name,email', 'repliedBy:id,name']));
    }

    // ── Stats for dashboard widget ───────────────────────────────────────────
    public function stats()
    {
        return response()->json([
            'open'        => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved'    => SupportTicket::where('status', 'resolved')->count(),
            'total'       => SupportTicket::count(),
        ]);
    }
}
