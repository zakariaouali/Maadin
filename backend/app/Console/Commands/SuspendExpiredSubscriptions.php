<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\User;
use App\Support\NotificationMessages;
use Illuminate\Console\Command;

class SuspendExpiredSubscriptions extends Command
{
    protected $signature = 'subscriptions:check';
    protected $description = 'Suspend stores whose subscription has expired; warn those expiring soon.';

    public function handle(): void
    {
        $admins = User::where('role', 'admin')->pluck('id');

        // ── Suspend expired ───────────────────────────────────────────────────
        $expired = User::where('role', 'seller')
            ->whereIn('plan', ['managed', 'premium'])
            ->whereNotNull('subscription_expires_at')
            ->whereDate('subscription_expires_at', '<', now())
            ->with('seller')
            ->get();

        foreach ($expired as $user) {
            if ($user->seller && $user->seller->status === 'verified') {
                $user->seller->update(['status' => 'suspended_subscription']);
                $this->line("Suspended: {$user->email}");

                // Notify seller
                $locale = $user->locale ?? 'en';
                [$title, $body] = NotificationMessages::get('subscription.expired', $locale, [
                    'plan' => ucfirst($user->plan),
                    'date' => $user->subscription_expires_at,
                ]);
                Notification::create([
                    'user_id' => $user->id,
                    'type'    => 'system',
                    'title'   => $title,
                    'body'    => $body,
                    'link'    => '/seller/subscription',
                ]);

                // Notify all admins
                foreach ($admins as $adminId) {
                    [$aTitle, $aBody] = NotificationMessages::get('admin.subscription_expired', 'en', [
                        'name' => $user->name,
                        'plan' => ucfirst($user->plan),
                        'date' => $user->subscription_expires_at,
                    ]);
                    Notification::create([
                        'user_id' => $adminId,
                        'type'    => 'system',
                        'title'   => $aTitle,
                        'body'    => $aBody,
                        'link'    => '/admin/subscriptions',
                    ]);
                }
            }
        }

        // ── Warn expiring in 7 days ───────────────────────────────────────────
        foreach ([7, 3] as $days) {
            $expiringSoon = User::where('role', 'seller')
                ->whereIn('plan', ['managed', 'premium'])
                ->whereNotNull('subscription_expires_at')
                ->whereDate('subscription_expires_at', now()->addDays($days)->toDateString())
                ->get();

            foreach ($expiringSoon as $user) {
                $this->line("Expiring in {$days}d: {$user->email}");
                $locale = $user->locale ?? 'en';
                [$title, $body] = NotificationMessages::get('subscription.expiring_soon', $locale, [
                    'days' => $days,
                    'plan' => ucfirst($user->plan),
                    'date' => $user->subscription_expires_at,
                ]);
                Notification::create([
                    'user_id' => $user->id,
                    'type'    => 'system',
                    'title'   => $title,
                    'body'    => $body,
                    'link'    => '/seller/subscription',
                ]);
            }
        }

        $this->info("Done. Suspended: {$expired->count()}");
    }
}
