<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\PlanUpgradeRequest;
use App\Models\User;
use App\Support\NotificationMessages;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function status(Request $request)
    {
        $user = $request->user();

        $pendingRequest = PlanUpgradeRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        $daysLeft = null;
        if ($user->subscription_expires_at) {
            $daysLeft = (int) round(now()->floatDiffInDays($user->subscription_expires_at, false));
        }

        return response()->json([
            'plan'                   => $user->plan,
            'subscription_expires_at'=> $user->subscription_expires_at,
            'monthly_fee'            => $user->monthly_fee,
            'days_left'              => $daysLeft,
            'store_status'           => $user->seller?->status,
            'pending_upgrade'        => $pendingRequest,
        ]);
    }

    public function requestUpgrade(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'to_plan' => 'required|in:managed,premium',
        ]);

        if ($validated['to_plan'] === $user->plan) {
            return response()->json(['message' => 'You are already on this plan.'], 422);
        }

        // One pending request at a time
        $existing = PlanUpgradeRequest::where('user_id', $user->id)->where('status', 'pending')->exists();
        if ($existing) {
            return response()->json(['message' => 'You already have a pending upgrade request.'], 422);
        }

        $upgradeRequest = PlanUpgradeRequest::create([
            'user_id'   => $user->id,
            'from_plan' => $user->plan,
            'to_plan'   => $validated['to_plan'],
            'status'    => 'pending',
        ]);

        // Pause seller store until admin confirms payment
        if ($user->seller && $user->seller->status === 'verified') {
            $user->seller->update(['status' => 'upgrade_pending']);
        }

        // Notify seller
        $locale = $user->locale ?? 'en';
        [$title, $body] = NotificationMessages::get('plan.upgrade_requested', $locale, [
            'from' => ucfirst($user->plan),
            'to'   => ucfirst($validated['to_plan']),
        ]);
        Notification::create(['user_id' => $user->id, 'type' => 'system', 'title' => $title, 'body' => $body, 'link' => '/seller/subscription']);

        // Notify all admins
        $admins = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            [$aTitle, $aBody] = NotificationMessages::get('admin.upgrade_requested', 'en', [
                'name' => $user->name,
                'from' => ucfirst($user->plan),
                'to'   => ucfirst($validated['to_plan']),
            ]);
            Notification::create([
                'user_id' => $adminId,
                'type'    => 'system',
                'title'   => $aTitle,
                'body'    => $aBody,
                'link'    => '/admin/subscriptions',
            ]);
        }

        return response()->json($upgradeRequest, 201);
    }
}
