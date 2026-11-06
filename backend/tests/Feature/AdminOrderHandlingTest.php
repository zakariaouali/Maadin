<?php

namespace Tests\Feature;

use App\Models\AdminAuditLog;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsShop;
use Tests\TestCase;

class AdminOrderHandlingTest extends TestCase
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

    /** Place a real order through checkout. Returns [seller, product, order]. */
    private function placeOrder(string $plan = 'managed', array $productAttrs = [], int $quantity = 2): array
    {
        $seller = $this->makeSeller("store-{$plan}@example.test", "Store {$plan}", $plan);
        $product = $this->makeProduct($seller, $productAttrs + ['stock_quantity' => 5]);

        Sanctum::actingAs($this->customer);
        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => $quantity],
        ]))->assertCreated();

        return [$seller, $product, Order::latest('id')->firstOrFail()];
    }

    public function test_admin_moves_a_managed_order_through_the_whole_flow(): void
    {
        [, , $order] = $this->placeOrder();
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])
            ->assertOk()->assertJsonPath('status', 'confirmed');
        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'shipped', 'tracking_number' => 'TRK-123'])
            ->assertOk()->assertJsonPath('tracking_number', 'TRK-123');
        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'delivered'])
            ->assertOk()->assertJsonPath('status', 'delivered')->assertJsonPath('payment_status', 'received');

        $order->refresh();
        $this->assertNotNull($order->shipped_at);
        $this->assertNotNull($order->delivered_at);
        $this->assertSame(1, Seller::find($order->seller_id)->total_orders);
    }

    public function test_the_customer_is_told_about_each_step(): void
    {
        [, , $order] = $this->placeOrder();
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertOk();

        $this->assertTrue(
            Notification::where('user_id', $this->customer->id)->where('type', 'order')->where('body', 'like', "%{$order->order_number}%")->exists()
        );
    }

    public function test_every_admin_action_is_written_to_the_audit_log_and_shown_on_the_order(): void
    {
        [, , $order] = $this->placeOrder();
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertOk();
        $this->putJson("/api/admin/orders/{$order->id}/hold", ['on_hold' => true, 'reason' => 'Call the customer first'])->assertOk();

        $actions = AdminAuditLog::where('subject_type', 'order')->where('subject_id', $order->id)->pluck('action')->all();
        $this->assertEqualsCanonicalizing(['order_status_changed', 'order_put_on_hold'], $actions);

        $this->getJson("/api/admin/orders/{$order->id}")
            ->assertOk()
            ->assertJsonCount(2, 'timeline')
            ->assertJsonPath('timeline.0.admin', 'Test Admin')
            ->assertJsonPath('is_managed', true);
    }

    public function test_a_step_cannot_be_skipped(): void
    {
        [, , $order] = $this->placeOrder();
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'shipped'])->assertStatus(422);
        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'delivered'])->assertStatus(422);

        $this->assertSame('pending', $order->fresh()->status);
    }

    public function test_cancelling_puts_the_stock_back_but_not_for_made_to_order(): void
    {
        [, $normal, $o1] = $this->placeOrder('managed', ['stock_quantity' => 5], 2);
        $this->assertSame(3, $normal->fresh()->stock_quantity);
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/orders/{$o1->id}/status", ['status' => 'cancelled'])->assertOk();
        $this->assertSame(5, $normal->fresh()->stock_quantity);

        [, $made, $o2] = $this->placeOrder('premium', ['stock_quantity' => 0, 'is_made_to_order' => true], 3);
        Sanctum::actingAs($this->admin);
        $this->putJson("/api/admin/orders/{$o2->id}/status", ['status' => 'cancelled'])->assertOk();
        $this->assertSame(0, $made->fresh()->stock_quantity);
    }

    public function test_an_order_on_hold_cannot_move_forward_until_released(): void
    {
        [, , $order] = $this->placeOrder();
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/orders/{$order->id}/hold", ['on_hold' => true, 'reason' => 'Customer unreachable'])
            ->assertOk()->assertJsonPath('on_hold', true)->assertJsonPath('hold_reason', 'Customer unreachable');

        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertStatus(422);
        $this->assertSame('pending', $order->fresh()->status);

        $this->putJson("/api/admin/orders/{$order->id}/hold", ['on_hold' => false])
            ->assertOk()->assertJsonPath('on_hold', false)->assertJsonPath('hold_reason', null);
        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertOk();
    }

    public function test_cancelling_an_order_on_hold_is_allowed_and_clears_the_hold(): void
    {
        [, , $order] = $this->placeOrder();
        Sanctum::actingAs($this->admin);
        $this->putJson("/api/admin/orders/{$order->id}/hold", ['on_hold' => true, 'reason' => 'x'])->assertOk();

        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertOk()->assertJsonPath('status', 'cancelled')->assertJsonPath('on_hold', false);
    }

    public function test_a_finished_order_cannot_be_put_on_hold(): void
    {
        [, , $order] = $this->placeOrder();
        $order->update(['status' => 'delivered']);
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/orders/{$order->id}/hold", ['on_hold' => true, 'reason' => 'x'])->assertStatus(422);
    }

    public function test_the_seller_screens_obey_the_same_hold_rule(): void
    {
        [$seller, , $order] = $this->placeOrder('premium');
        $order->update(['on_hold' => true]);
        Sanctum::actingAs($seller->user);

        $this->putJson("/api/seller/orders/{$order->id}/status", ['status' => 'confirmed'])->assertStatus(422);
    }

    public function test_the_admin_cannot_act_on_a_store_that_runs_its_own_orders(): void
    {
        [, , $order] = $this->placeOrder('starter');
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertForbidden();
        $this->putJson("/api/admin/orders/{$order->id}/hold", ['on_hold' => true])->assertForbidden();
        $this->postJson("/api/admin/orders/{$order->id}/message", ['content' => 'Hello'])->assertForbidden();
        $this->assertSame('pending', $order->fresh()->status);
    }

    public function test_only_admins_can_use_the_admin_order_actions(): void
    {
        [$seller, , $order] = $this->placeOrder();

        Sanctum::actingAs($seller->user);
        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertForbidden();

        Sanctum::actingAs($this->customer);
        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertForbidden();
        $this->postJson("/api/admin/orders/{$order->id}/message", ['content' => 'Hi'])->assertForbidden();

        $this->app['auth']->forgetGuards();
        $this->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'confirmed'])->assertUnauthorized();
    }

    public function test_admin_messages_the_customer_as_the_store_in_a_conversation_tied_to_the_order(): void
    {
        [$seller, , $order] = $this->placeOrder();
        Sanctum::actingAs($this->admin);

        $this->postJson("/api/admin/orders/{$order->id}/message", ['content' => 'Hello, can we confirm your delivery address?'])
            ->assertCreated();

        $conversation = Conversation::where('buyer_id', $this->customer->id)->where('seller_id', $seller->user_id)->firstOrFail();
        $this->assertSame($order->id, $conversation->order_id);

        $message = Message::where('conversation_id', $conversation->id)->firstOrFail();
        $this->assertSame($seller->user_id, $message->sender_id, 'it must come from the store, not the admin');
        $this->assertSame($this->customer->id, $message->receiver_id);
        $this->assertTrue(Notification::where('user_id', $this->customer->id)->where('type', 'message')->exists());
        $this->assertTrue(AdminAuditLog::where('action', 'order_message_sent')->where('subject_id', $order->id)->exists());
    }

    public function test_an_empty_or_huge_message_is_refused(): void
    {
        [, , $order] = $this->placeOrder();
        Sanctum::actingAs($this->admin);

        $this->postJson("/api/admin/orders/{$order->id}/message", ['content' => ''])->assertStatus(422);
        $this->postJson("/api/admin/orders/{$order->id}/message", ['content' => str_repeat('a', 2001)])->assertStatus(422);
    }

    public function test_admins_get_an_alert_for_a_new_order_on_a_managed_store_and_checkout_still_works(): void
    {
        // no ADMIN_NOTIFICATION_EMAIL in tests: the alert email fails, and that must not break the order
        $this->placeOrder('managed');

        $this->assertSame(1, Order::count());
        $this->assertTrue(Notification::where('user_id', $this->admin->id)->where('type', 'order')->exists());
    }

    public function test_no_admin_alert_for_a_store_that_runs_its_own_orders(): void
    {
        $this->placeOrder('starter');

        $this->assertFalse(Notification::where('user_id', $this->admin->id)->exists());
    }

    public function test_the_admin_list_can_show_only_held_orders(): void
    {
        [, , $held] = $this->placeOrder('managed');
        $held->update(['on_hold' => true]);
        $this->placeOrder('premium');
        Sanctum::actingAs($this->admin);

        $this->getJson('/api/admin/orders?on_hold=1')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $held->id);
    }
}
