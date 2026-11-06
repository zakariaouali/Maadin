<?php

namespace Tests\Feature;

use App\Models\AdminAuditLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsShop;
use Tests\TestCase;

class AdminToolsTest extends TestCase
{
    use RefreshDatabase, BuildsShop;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->makeAdmin();
    }

    // ── hide / show a live product ───────────────────────────────────────────

    public function test_hiding_a_live_product_takes_it_off_the_shop_and_out_of_checkout_and_showing_it_brings_it_back(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller);
        $customer = $this->makeCustomer();

        Sanctum::actingAs($this->admin);
        $this->putJson("/api/admin/products/{$product->id}/toggle-active")->assertOk()->assertJsonPath('is_active', false);

        $this->getJson('/api/products')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/products/{$product->slug}")->assertNotFound();
        Sanctum::actingAs($customer);
        $this->postJson('/api/customer/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->assertStatus(422);

        Sanctum::actingAs($this->admin);
        $this->putJson("/api/admin/products/{$product->id}/toggle-active")->assertOk()->assertJsonPath('is_active', true);
        $this->getJson('/api/products')->assertJsonCount(1, 'data');

        $this->assertSame(2, AdminAuditLog::where('action', 'toggle_product_active')->where('subject_id', $product->id)->count());
    }

    public function test_only_admins_can_hide_products(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller);

        Sanctum::actingAs($seller->user);
        $this->putJson("/api/admin/products/{$product->id}/toggle-active")->assertForbidden();
        $this->assertTrue($product->fresh()->is_active);
    }

    // ── user detail ──────────────────────────────────────────────────────────

    public function test_the_user_detail_shows_activity_orders_store_and_what_the_team_did(): void
    {
        $seller = $this->makeSeller('own@example.test', 'Own Store');
        $product = $this->makeProduct($seller);
        $buyer = $this->makeCustomer();
        Sanctum::actingAs($buyer);
        $this->postJson('/api/customer/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 2]]))->assertCreated();
        Order::first()->update(['status' => 'delivered']);

        Sanctum::actingAs($this->admin);
        $this->putJson("/api/admin/users/{$buyer->id}/status", ['status' => 'suspended'])->assertOk();

        $buyerView = $this->getJson("/api/admin/users/{$buyer->id}")->assertOk();
        $buyerView->assertJsonPath('stats.orders_count', 1)
            ->assertJsonPath('stats.delivered_total', 200)
            ->assertJsonCount(1, 'recent_orders')
            ->assertJsonPath('history.0.action', 'update_user_status')
            ->assertJsonPath('history.0.admin', 'Test Admin');

        $this->getJson("/api/admin/users/{$seller->user_id}")->assertOk()
            ->assertJsonPath('seller.store_name', 'Own Store')
            ->assertJsonPath('stats.products_count', 1)
            ->assertJsonPath('stats.store_orders_count', 1);
    }

    public function test_the_user_detail_never_exposes_password_hashes(): void
    {
        Sanctum::actingAs($this->admin);

        $json = $this->getJson('/api/admin/users/' . $this->makeCustomer()->id)->assertOk()->json();

        $this->assertArrayNotHasKey('password', $json);
        $this->assertArrayNotHasKey('remember_token', $json);
    }

    public function test_only_admins_can_open_a_user_detail(): void
    {
        $customer = $this->makeCustomer();
        Sanctum::actingAs($customer);

        $this->getJson("/api/admin/users/{$customer->id}")->assertForbidden();
    }

    // ── audit log ────────────────────────────────────────────────────────────

    public function test_admin_actions_that_used_to_leave_no_trace_are_now_logged(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller);
        $customer = $this->makeCustomer();
        Sanctum::actingAs($customer);
        $this->postJson('/api/customer/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->assertCreated();
        $review = Review::create([
            'product_id' => $product->id, 'order_id' => Order::firstOrFail()->id, 'customer_id' => $customer->id, 'seller_id' => $seller->id,
            'rating' => 3, 'content' => 'It is fine, nothing special.', 'status' => 'approved',
        ]);
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/admin/reviews/{$review->id}/reject")->assertOk();
        $this->putJson("/api/admin/reviews/{$review->id}/approve")->assertOk();
        $this->deleteJson("/api/admin/reviews/{$review->id}")->assertOk();
        $this->postJson('/api/admin/penalties', [
            'seller_id' => $seller->id, 'reason' => 'bad_behavior', 'description' => 'Rude to customers', 'penalty_type' => 'warning',
        ])->assertCreated();
        $category = $this->postJson('/api/admin/categories', ['name' => 'Zellige'])->assertCreated()->json('id');
        $this->putJson("/api/admin/categories/{$category}", ['name' => 'Zellige tiles'])->assertOk();
        $this->deleteJson("/api/admin/categories/{$category}")->assertOk();

        $logged = AdminAuditLog::pluck('action')->all();
        foreach (['reject_review', 'approve_review', 'remove_review', 'issue_penalty', 'create_category', 'update_category', 'delete_category'] as $action) {
            $this->assertContains($action, $logged, "{$action} should be in the audit log");
        }
    }

    public function test_subscription_and_plan_changes_are_logged(): void
    {
        $managed = $this->makeSeller('m@example.test', 'Managed Store', 'managed');
        Sanctum::actingAs($this->admin);

        $this->postJson("/api/admin/managed-sellers/{$managed->user_id}/mark-paid")->assertOk();
        $this->putJson("/api/admin/managed-sellers/{$managed->user_id}/subscription", [
            'subscription_expires_at' => now()->addMonths(2)->toDateString(), 'monthly_fee' => 300,
        ])->assertOk();

        $logged = AdminAuditLog::where('subject_type', 'user')->where('subject_id', $managed->user_id)->pluck('action')->all();
        $this->assertEqualsCanonicalSets(['mark_subscription_paid', 'update_subscription'], $logged);
    }

    public function test_the_audit_log_lists_newest_first_with_the_admin_name_and_filters(): void
    {
        $other = $this->makeAdmin('second@example.test');
        $u1 = $this->makeCustomer('a@example.test');
        $u2 = $this->makeCustomer('b@example.test');

        Sanctum::actingAs($this->admin);
        $this->putJson("/api/admin/users/{$u1->id}/status", ['status' => 'suspended'])->assertOk();
        Sanctum::actingAs($other);
        $this->putJson("/api/admin/users/{$u2->id}/status", ['status' => 'banned'])->assertOk();
        $product = $this->makeProduct($this->makeSeller());
        $this->putJson("/api/admin/products/{$product->id}/toggle-active")->assertOk();

        $all = $this->getJson('/api/admin/audit-logs')->assertOk();
        $all->assertJsonCount(3, 'data')->assertJsonPath('data.0.action', 'toggle_product_active')->assertJsonPath('data.0.admin.name', 'Test Admin');
        $this->assertEqualsCanonicalizing(['toggle_product_active', 'update_user_status'], $all->json('filters.actions'));
        $this->assertEqualsCanonicalizing(['product', 'user'], $all->json('filters.subject_types'));

        $this->getJson('/api/admin/audit-logs?action=update_user_status')->assertJsonCount(2, 'data');
        $this->getJson("/api/admin/audit-logs?admin_id={$this->admin->id}")->assertJsonCount(1, 'data')->assertJsonPath('data.0.subject_id', $u1->id);
        $this->getJson('/api/admin/audit-logs?subject_type=product')->assertJsonCount(1, 'data');
        $this->getJson("/api/admin/audit-logs?subject_id={$u2->id}")->assertJsonCount(1, 'data');
    }

    public function test_the_audit_log_filters_by_date_and_pages_through_the_results(): void
    {
        $user = $this->makeCustomer();
        Sanctum::actingAs($this->admin);
        for ($i = 0; $i < 30; $i++) {
            AdminAuditLog::create(['admin_id' => $this->admin->id, 'action' => 'update_user_status', 'subject_type' => 'user', 'subject_id' => $user->id, 'changes' => []]);
        }
        AdminAuditLog::query()->limit(5)->update(['created_at' => now()->subDays(10)]);

        $first = $this->getJson('/api/admin/audit-logs')->assertOk();
        $this->assertCount(25, $first->json('data'));
        $this->assertSame(30, $first->json('total'));
        $this->getJson('/api/admin/audit-logs?page=2')->assertJsonCount(5, 'data');

        $this->getJson('/api/admin/audit-logs?from=' . now()->subDay()->toDateString())->assertJsonPath('total', 25);
        $this->getJson('/api/admin/audit-logs?to=' . now()->subDays(5)->toDateString())->assertJsonPath('total', 5);
    }

    public function test_only_admins_can_read_the_audit_log(): void
    {
        $seller = $this->makeSeller();

        Sanctum::actingAs($seller->user);
        $this->getJson('/api/admin/audit-logs')->assertForbidden();
        Sanctum::actingAs($this->makeCustomer());
        $this->getJson('/api/admin/audit-logs')->assertForbidden();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/admin/audit-logs')->assertUnauthorized();
    }

    private function assertEqualsCanonicalSets(array $expected, array $actual): void
    {
        $this->assertEqualsCanonicalizing($expected, $actual);
    }
}
