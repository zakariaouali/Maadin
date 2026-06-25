<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SuspendExpiredSubscriptions extends Command
{
    protected $signature = 'subscriptions:check';
    protected $description = 'Suspend stores whose subscription has expired; warn those expiring soon.';

    public function handle(): void
    {
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
            }
        }

        $expiringSoon = User::where('role', 'seller')
            ->whereIn('plan', ['managed', 'premium'])
            ->whereNotNull('subscription_expires_at')
            ->whereDate('subscription_expires_at', now()->addDays(3)->toDateString())
            ->get();

        foreach ($expiringSoon as $user) {
            $this->line("Expiring soon: {$user->email} — {$user->subscription_expires_at}");
            // TODO: fire email/SMS notification
        }

        $this->info("Done. Suspended: {$expired->count()}, Expiring soon: {$expiringSoon->count()}");
    }
}
