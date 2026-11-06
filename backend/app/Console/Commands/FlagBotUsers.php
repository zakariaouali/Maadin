<?php

namespace App\Console\Commands;

use App\Models\Message;
use App\Models\User;
use Illuminate\Console\Command;

/**
 * Finds the fake "seller" accounts that bots created through the open registration form:
 * random letter-soup names, no store, no orders, never wrote a message. Lists them by default;
 * --suspend blocks them (reversible: an admin can activate an account again).
 */
class FlagBotUsers extends Command
{
    protected $signature = 'users:flag-bots {--suspend : Suspend the accounts found (without it, they are only listed)}';

    protected $description = 'List (and optionally suspend) bot-created seller accounts';

    public function handle(): int
    {
        $found = User::where('role', 'seller')
            ->where('status', 'active')
            ->whereDoesntHave('seller')
            ->whereDoesntHave('orders')
            ->whereNotIn('id', Message::query()->select('sender_id'))
            ->orderBy('id')
            ->get()
            ->filter(fn (User $u) => self::looksRandom($u->name));

        if ($found->isEmpty()) {
            $this->info('No bot-like accounts found.');

            return self::SUCCESS;
        }

        $this->table(
            ['id', 'name', 'email', 'created'],
            $found->map(fn (User $u) => [$u->id, $u->name, $u->email, $u->created_at?->toDateString()])->all()
        );
        $this->line($found->count() . ' account(s) look like bots (random name, no store, no orders, no messages).');

        if (!$this->option('suspend')) {
            $this->comment('Nothing was changed. Run again with --suspend to block them.');

            return self::SUCCESS;
        }

        if (!$this->confirm('Suspend these ' . $found->count() . ' accounts?')) {
            $this->comment('Cancelled, nothing was changed.');

            return self::SUCCESS;
        }

        User::whereIn('id', $found->pluck('id'))->update(['status' => 'suspended']);
        $this->info($found->count() . ' account(s) suspended.');

        return self::SUCCESS;
    }

    /** One word of 10+ letters that flips between lower and upper case again and again ("yWEbmArgbHYrf..."). */
    public static function looksRandom(string $name): bool
    {
        if (!preg_match('/^[A-Za-z]{10,}$/', $name)) {
            return false;
        }

        $flips = 0;
        for ($i = 1, $n = strlen($name); $i < $n; $i++) {
            if (ctype_upper($name[$i]) !== ctype_upper($name[$i - 1])) {
                $flips++;
            }
        }

        return $flips >= 4;
    }
}
