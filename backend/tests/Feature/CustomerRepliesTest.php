<?php

namespace Tests\Feature;

use App\Models\AdminAuditLog;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsShop;
use Tests\TestCase;

class CustomerRepliesTest extends TestCase
{
    use RefreshDatabase, BuildsShop;

    private User $admin;
    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->makeAdmin();
        $this->customer = $this->makeCustomer();
    }

    /** The customer writes to a store through the normal messaging route. */
    private function customerWrites(Seller $store, string $text = 'Is it available in blue?'): Conversation
    {
        Sanctum::actingAs($this->customer);
        $this->postJson('/api/messages/send', ['receiver_id' => $store->user_id, 'content' => $text])->assertCreated();

        return Conversation::where('buyer_id', $this->customer->id)->where('seller_id', $store->user_id)->firstOrFail();
    }

    public function test_a_customer_message_to_a_managed_store_alerts_the_admins_with_a_link_to_the_conversation(): void
    {
        $store = $this->makeSeller('m@example.test', 'Managed Store', 'managed');

        $conversation = $this->customerWrites($store);

        $alert = Notification::where('user_id', $this->admin->id)->where('type', 'message')->firstOrFail();
        $this->assertSame("/admin/conversations/{$conversation->id}", $alert->link);
        $this->assertStringContainsString('Is it available in blue?', $alert->body);
    }

    public function test_the_message_is_still_sent_when_the_admin_alert_email_cannot_be_sent(): void
    {
        // no ADMIN_NOTIFICATION_EMAIL in the test environment: the alert email throws, and that must be swallowed
        $store = $this->makeSeller('p@example.test', 'Premium Store', 'premium');

        $this->customerWrites($store);

        $this->assertSame(1, Message::count());
    }

    public function test_no_admin_alert_for_a_store_that_answers_its_own_messages(): void
    {
        $store = $this->makeSeller('s@example.test', 'Own Store', 'starter');

        $this->customerWrites($store);

        $this->assertFalse(Notification::where('user_id', $this->admin->id)->exists());
    }

    public function test_the_admin_conversation_view_says_whether_the_team_can_answer(): void
    {
        $managed = $this->makeSeller('m@example.test', 'Managed Store', 'managed');
        $own = $this->makeSeller('o@example.test', 'Own Store', 'starter');
        $c1 = $this->customerWrites($managed);
        $c2 = $this->customerWrites($own);
        Sanctum::actingAs($this->admin);

        $this->getJson("/api/admin/conversations/{$c1->id}")
            ->assertOk()->assertJsonPath('can_reply', true)->assertJsonPath('store_name', 'Managed Store');
        $this->getJson("/api/admin/conversations/{$c2->id}")
            ->assertOk()->assertJsonPath('can_reply', false);
    }

    public function test_the_admin_answers_as_the_store_and_the_customers_message_counts_as_read(): void
    {
        $store = $this->makeSeller('m@example.test', 'Managed Store', 'managed');
        $conversation = $this->customerWrites($store);
        $this->assertFalse((bool) Message::first()->is_read);

        Sanctum::actingAs($this->admin);
        $this->postJson("/api/admin/conversations/{$conversation->id}/reply", ['content' => 'Yes, we have it in blue.'])
            ->assertCreated();

        $reply = Message::where('content', 'Yes, we have it in blue.')->firstOrFail();
        $this->assertSame($store->user_id, $reply->sender_id, 'it must come from the store, not the admin');
        $this->assertSame($this->customer->id, $reply->receiver_id);
        $this->assertSame($conversation->id, $reply->conversation_id);
        $this->assertTrue((bool) Message::where('content', 'Is it available in blue?')->first()->is_read);
        $this->assertTrue(Notification::where('user_id', $this->customer->id)->where('type', 'message')->exists());
        $this->assertTrue(AdminAuditLog::where('action', 'conversation_reply_sent')->where('subject_id', $conversation->id)->exists());
    }

    public function test_the_admin_reply_does_not_alert_the_admins_again(): void
    {
        $store = $this->makeSeller('m@example.test', 'Managed Store', 'managed');
        $conversation = $this->customerWrites($store);
        $before = Notification::where('user_id', $this->admin->id)->count();

        Sanctum::actingAs($this->admin);
        $this->postJson("/api/admin/conversations/{$conversation->id}/reply", ['content' => 'Hello'])->assertCreated();

        $this->assertSame($before, Notification::where('user_id', $this->admin->id)->count());
    }

    public function test_the_admin_cannot_answer_for_a_store_that_runs_its_own_messages(): void
    {
        $store = $this->makeSeller('o@example.test', 'Own Store', 'starter');
        $conversation = $this->customerWrites($store);
        Sanctum::actingAs($this->admin);

        $this->postJson("/api/admin/conversations/{$conversation->id}/reply", ['content' => 'Hello'])->assertForbidden();
        $this->assertSame(1, Message::count());
    }

    public function test_only_admins_can_reply_through_the_admin_route(): void
    {
        $store = $this->makeSeller('m@example.test', 'Managed Store', 'managed');
        $conversation = $this->customerWrites($store);

        Sanctum::actingAs($this->customer);
        $this->postJson("/api/admin/conversations/{$conversation->id}/reply", ['content' => 'Hi'])->assertForbidden();

        Sanctum::actingAs($store->user);
        $this->postJson("/api/admin/conversations/{$conversation->id}/reply", ['content' => 'Hi'])->assertForbidden();

        $this->app['auth']->forgetGuards();
        $this->postJson("/api/admin/conversations/{$conversation->id}/reply", ['content' => 'Hi'])->assertUnauthorized();
    }

    public function test_an_empty_or_huge_reply_is_refused(): void
    {
        $store = $this->makeSeller('m@example.test', 'Managed Store', 'managed');
        $conversation = $this->customerWrites($store);
        Sanctum::actingAs($this->admin);

        $this->postJson("/api/admin/conversations/{$conversation->id}/reply", ['content' => ''])->assertStatus(422);
        $this->postJson("/api/admin/conversations/{$conversation->id}/reply", ['content' => str_repeat('a', 2001)])->assertStatus(422);
    }
}
