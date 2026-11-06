<?php

namespace Tests\Feature;

use App\Console\Commands\FlagBotUsers;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\BuildsShop;
use Tests\TestCase;

class RegistrationProtectionTest extends TestCase
{
    use RefreshDatabase, BuildsShop;

    private function signup(array $over = [])
    {
        return $this->postJson('/api/register', $over + [
            'name' => 'Real Person', 'email' => 'person' . uniqid() . '@example.test', 'password' => 'secret-pass-123',
            'role' => 'customer', 'fill_seconds' => 12,
        ]);
    }

    // ── what a bot does ──────────────────────────────────────────────────────

    public function test_a_normal_signup_still_works(): void
    {
        $this->signup()->assertOk()->assertJsonPath('user.role', 'customer');
        $this->assertSame(1, User::where('role', 'customer')->count());
    }

    public function test_a_bot_that_fills_the_hidden_trap_field_is_refused_and_no_account_is_created(): void
    {
        $this->signup(['website' => 'http://spam.example'])->assertStatus(422);

        $this->assertSame(0, User::count());
    }

    public function test_a_signup_that_was_too_fast_or_has_no_timer_is_refused(): void
    {
        $this->signup(['fill_seconds' => 1])->assertStatus(422);
        $this->signup(['fill_seconds' => 0])->assertStatus(422);

        $withoutTimer = ['name' => 'Bot', 'email' => 'bot@example.test', 'password' => 'secret-pass-123', 'role' => 'seller'];
        $this->postJson('/api/register', $withoutTimer)->assertStatus(422);

        $this->assertSame(0, User::count());
    }

    public function test_the_refusal_does_not_reveal_which_trap_was_hit(): void
    {
        $a = $this->signup(['website' => 'x'])->json('message');
        $b = $this->signup(['fill_seconds' => 0])->json('message');

        $this->assertSame($a, $b);
        $this->assertStringNotContainsStringIgnoringCase('website', $a);
    }

    public function test_one_address_cannot_register_more_than_five_accounts_an_hour(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->signup()->assertOk();
        }

        $this->signup()->assertStatus(429);
        $this->assertSame(5, User::count());
    }

    // ── Cloudflare Turnstile, once the keys are added ────────────────────────

    public function test_with_turnstile_switched_on_a_signup_without_a_valid_token_is_refused(): void
    {
        config(['services.turnstile.secret' => 'test-secret']);
        Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => false])]);

        $this->signup()->assertStatus(422);                                    // no token at all
        $this->signup(['turnstile_token' => 'bad'])->assertStatus(422);        // Cloudflare says no

        $this->assertSame(0, User::count());
    }

    public function test_with_turnstile_switched_on_a_valid_token_lets_the_signup_through(): void
    {
        config(['services.turnstile.secret' => 'test-secret']);
        Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);

        $this->signup(['turnstile_token' => 'good'])->assertOk();

        Http::assertSent(fn ($request) => $request['secret'] === 'test-secret' && $request['response'] === 'good');
    }

    public function test_if_cloudflare_cannot_be_reached_the_signup_is_refused(): void
    {
        config(['services.turnstile.secret' => 'test-secret']);
        Http::fake(['challenges.cloudflare.com/*' => Http::response('error', 500)]);

        $this->signup(['turnstile_token' => 'whatever'])->assertStatus(422);
    }

    // ── cleaning up the accounts bots already made ───────────────────────────

    public function test_the_random_name_check_catches_bot_names_and_spares_real_ones(): void
    {
        foreach (['yWEbmArgbHYrfYGdBNULHgF', 'ZNoxWcaEOhrkATxSXKUD', 'uCHiuGdjNmwCzGBK', 'AiVsUyZYsDoqzBqLZXI'] as $bot) {
            $this->assertTrue(FlagBotUsers::looksRandom($bot), $bot);
        }
        foreach (['Hakim el Badraoui', 'ABDESSAMAD', 'Khaoula', 'Anas', 'Marrakech Maadine', 'Zakaria', 'MohammedAlaoui', 'Test Seller'] as $real) {
            $this->assertFalse(FlagBotUsers::looksRandom($real), $real);
        }
    }

    private function seedAccounts(): array
    {
        $bot = $this->botSeller('yWEbmArgbHYrfYGdBNULHgF', 'bot1@example.test');
        $bot2 = $this->botSeller('ZNoxWcaEOhrkATxSXKUD', 'bot2@example.test');
        $realWithStore = $this->makeSeller('real@example.test', 'Real Store');          // has a store
        $realWithStore->user->update(['name' => 'qWErTyUiOpAsDfGh']);                  // even with a random-looking name
        $oddNameNoStore = $this->botSeller('Hakim el Badraoui', 'hakim@example.test'); // a normal name
        $randomCustomer = $this->makeCustomer('c@example.test');
        $randomCustomer->update(['name' => 'xKcDeFgHiJkLmNoP']);                       // a customer, not a seller
        $talker = $this->botSeller('aBcDeFgHiJkLmNoP', 'talker@example.test');
        Message::create(['conversation_id' => $this->conversationFor($talker, $randomCustomer), 'sender_id' => $talker->id, 'receiver_id' => $randomCustomer->id, 'content' => 'hello']);

        return compact('bot', 'bot2', 'realWithStore', 'oddNameNoStore', 'randomCustomer', 'talker');
    }

    private function botSeller(string $name, string $email): User
    {
        return User::create(['name' => $name, 'email' => $email, 'password' => 'secret-pass-123', 'role' => 'seller', 'plan' => 'starter', 'status' => 'active', 'locale' => 'en']);
    }

    private function conversationFor(User $seller, User $customer): int
    {
        return \App\Models\Conversation::create(['buyer_id' => $customer->id, 'seller_id' => $seller->id])->id;
    }

    public function test_the_cleanup_command_only_lists_by_default(): void
    {
        $a = $this->seedAccounts();

        $this->artisan('users:flag-bots')->assertSuccessful();

        $this->assertSame('active', $a['bot']->fresh()->status);
        $this->assertSame('active', $a['bot2']->fresh()->status);
    }

    public function test_the_cleanup_command_suspends_only_the_bots_when_asked(): void
    {
        $a = $this->seedAccounts();

        $this->artisan('users:flag-bots', ['--suspend' => true])->expectsConfirmation('Suspend these 2 accounts?', 'yes')->assertSuccessful();

        $this->assertSame('suspended', $a['bot']->fresh()->status);
        $this->assertSame('suspended', $a['bot2']->fresh()->status);
        foreach (['realWithStore', 'oddNameNoStore', 'randomCustomer', 'talker'] as $safe) {
            $account = $a[$safe] instanceof User ? $a[$safe] : $a[$safe]->user; // a store model stands for its owner
            $this->assertSame('active', $account->fresh()->status, "{$safe} must not be touched");
        }
    }

    public function test_declining_the_confirmation_changes_nothing(): void
    {
        $a = $this->seedAccounts();

        $this->artisan('users:flag-bots', ['--suspend' => true])->expectsConfirmation('Suspend these 2 accounts?', 'no')->assertSuccessful();

        $this->assertSame('active', $a['bot']->fresh()->status);
    }

    public function test_a_suspended_bot_can_no_longer_sign_in(): void
    {
        $bot = $this->botSeller('yWEbmArgbHYrfYGdBNULHgF', 'bot1@example.test');
        $this->artisan('users:flag-bots', ['--suspend' => true])->expectsConfirmation('Suspend these 1 accounts?', 'yes')->assertSuccessful();

        $this->postJson('/api/login', ['email' => $bot->email, 'password' => 'secret-pass-123'])->assertStatus(403);
    }
}
