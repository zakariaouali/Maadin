<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsShop;
use Tests\TestCase;

class CustomerAccountTest extends TestCase
{
    use RefreshDatabase, BuildsShop;

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = $this->makeCustomer();
    }

    private function address(array $over = []): array
    {
        return $over + ['label' => 'Home', 'address' => '12 Rue Test', 'city' => 'Marrakech', 'phone' => '0612345678'];
    }

    /** A delivered order for the customer, placed through checkout. Returns [product, order]. */
    private function deliveredOrder(string $plan = 'starter'): array
    {
        $seller = $this->makeSeller("s-{$plan}@example.test", "Store {$plan}", $plan);
        $product = $this->makeProduct($seller);
        Sanctum::actingAs($this->customer);
        $this->postJson('/api/customer/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->assertCreated();
        $order = Order::latest('id')->firstOrFail();
        $order->update(['status' => 'delivered', 'delivered_at' => now()]);

        return [$product, $order];
    }

    // ── status dates / privacy ───────────────────────────────────────────────

    public function test_confirming_and_cancelling_record_when_they_happened(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller);
        Sanctum::actingAs($this->customer);
        $this->postJson('/api/customer/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->assertCreated();
        $order = Order::firstOrFail();

        Sanctum::actingAs($seller->user);
        $this->putJson("/api/seller/orders/{$order->id}/status", ['status' => 'confirmed'])->assertOk();
        $this->assertNotNull($order->fresh()->confirmed_at);

        $this->putJson("/api/seller/orders/{$order->id}/status", ['status' => 'cancelled'])->assertOk();
        $this->assertNotNull($order->fresh()->cancelled_at);
    }

    public function test_a_customer_cancelling_records_the_time(): void
    {
        $product = $this->makeProduct($this->makeSeller());
        Sanctum::actingAs($this->customer);
        $this->postJson('/api/customer/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->assertCreated();
        $order = Order::firstOrFail();

        $this->putJson("/api/customer/orders/{$order->id}/cancel")->assertOk();

        $this->assertNotNull($order->fresh()->cancelled_at);
    }

    public function test_the_internal_hold_reason_never_reaches_the_customer_but_does_reach_the_admin(): void
    {
        [, $order] = $this->deliveredOrder('managed');
        $order->update(['status' => 'pending', 'on_hold' => true, 'hold_reason' => 'Customer unreachable, do not ship']);

        Sanctum::actingAs($this->customer);
        $mine = $this->getJson("/api/customer/orders/{$order->id}")->assertOk();
        $this->assertArrayNotHasKey('hold_reason', $mine->json());
        $this->assertTrue($mine->json('on_hold'));
        $this->assertStringNotContainsString('unreachable', json_encode($this->getJson('/api/customer/orders')->json()));

        Sanctum::actingAs($this->makeAdmin());
        $this->getJson("/api/admin/orders/{$order->id}")->assertOk()->assertJsonPath('hold_reason', 'Customer unreachable, do not ship');
    }

    // ── address book ─────────────────────────────────────────────────────────

    public function test_the_first_saved_address_becomes_the_default(): void
    {
        Sanctum::actingAs($this->customer);

        $this->postJson('/api/customer/addresses', $this->address())->assertCreated()->assertJsonPath('is_default', true);
        $this->postJson('/api/customer/addresses', $this->address(['label' => 'Work']))->assertCreated()->assertJsonPath('is_default', false);
    }

    public function test_choosing_a_new_default_replaces_the_old_one(): void
    {
        Sanctum::actingAs($this->customer);
        $first = $this->postJson('/api/customer/addresses', $this->address())->json('id');
        $second = $this->postJson('/api/customer/addresses', $this->address(['label' => 'Work', 'is_default' => true]))->json('id');

        $this->assertFalse(Address::find($first)->is_default);
        $this->assertTrue(Address::find($second)->is_default);
        $this->assertSame(1, Address::where('user_id', $this->customer->id)->where('is_default', true)->count());
    }

    public function test_there_is_always_one_default(): void
    {
        Sanctum::actingAs($this->customer);
        $first = $this->postJson('/api/customer/addresses', $this->address())->json('id');

        // un-ticking "default" on the only default keeps it
        $this->putJson("/api/customer/addresses/{$first}", $this->address(['is_default' => false]))->assertOk()->assertJsonPath('is_default', true);

        // deleting the default promotes the most recent other address
        $second = $this->postJson('/api/customer/addresses', $this->address(['label' => 'Work']))->json('id');
        $this->deleteJson("/api/customer/addresses/{$first}")->assertOk();
        $this->assertTrue(Address::find($second)->is_default);
    }

    public function test_the_list_shows_the_default_first_and_only_my_addresses(): void
    {
        $other = $this->makeCustomer('other@example.test');
        Address::create($this->address(['user_id' => $other->id, 'is_default' => true]));
        Sanctum::actingAs($this->customer);
        $this->postJson('/api/customer/addresses', $this->address(['label' => 'Home']));
        $this->postJson('/api/customer/addresses', $this->address(['label' => 'Work', 'is_default' => true]));

        $list = $this->getJson('/api/customer/addresses')->assertOk()->assertJsonCount(2)->json();
        $this->assertSame('Work', $list[0]['label']);
    }

    public function test_nobody_can_touch_someone_elses_address(): void
    {
        $other = $this->makeCustomer('other@example.test');
        $theirs = Address::create($this->address(['user_id' => $other->id, 'is_default' => true]));
        Sanctum::actingAs($this->customer);

        $this->putJson("/api/customer/addresses/{$theirs->id}", $this->address(['city' => 'Hacked']))->assertNotFound();
        $this->deleteJson("/api/customer/addresses/{$theirs->id}")->assertNotFound();
        $this->assertSame('Marrakech', $theirs->fresh()->city);
    }

    public function test_address_rules_are_enforced(): void
    {
        Sanctum::actingAs($this->customer);

        $this->postJson('/api/customer/addresses', ['city' => 'Marrakech'])->assertStatus(422);
        $this->postJson('/api/customer/addresses', $this->address(['phone' => str_repeat('1', 21)]))->assertStatus(422);

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/customer/addresses', $this->address(['label' => "A{$i}"]))->assertCreated();
        }
        $this->postJson('/api/customer/addresses', $this->address())->assertStatus(422);
    }

    public function test_guests_cannot_use_the_address_book(): void
    {
        $this->getJson('/api/customer/addresses')->assertUnauthorized();
        $this->postJson('/api/customer/addresses', $this->address())->assertUnauthorized();
    }

    // ── my reviews ───────────────────────────────────────────────────────────

    public function test_a_customer_can_edit_their_review_and_the_product_rating_follows(): void
    {
        [$product, $order] = $this->deliveredOrder();
        Sanctum::actingAs($this->customer);
        $id = $this->postJson('/api/customer/reviews', [
            'order_id' => $order->id, 'product_id' => $product->id, 'rating' => 5, 'content' => 'Wonderful craftsmanship.',
        ])->assertCreated()->json('id');
        $this->assertEquals(5, $product->fresh()->rating);

        $this->putJson("/api/customer/reviews/{$id}", ['rating' => 2, 'content' => 'Changed my mind about it.'])
            ->assertOk()->assertJsonPath('rating', 2);

        $this->assertEquals(2, $product->fresh()->rating);
        $this->assertSame('Changed my mind about it.', Review::find($id)->content);
    }

    public function test_deleting_a_review_removes_it_from_the_rating_and_lets_the_customer_review_again(): void
    {
        [$product, $order] = $this->deliveredOrder();
        Sanctum::actingAs($this->customer);
        $payload = ['order_id' => $order->id, 'product_id' => $product->id, 'rating' => 4, 'content' => 'Very nice indeed.'];
        $id = $this->postJson('/api/customer/reviews', $payload)->json('id');

        $this->deleteJson("/api/customer/reviews/{$id}")->assertOk();

        $this->assertSame(0, Review::count());
        $this->assertEquals(0, $product->fresh()->rating);
        $this->assertSame(0, $product->fresh()->total_reviews);
        $this->postJson('/api/customer/reviews', $payload)->assertCreated();
    }

    public function test_a_review_the_admin_removed_cannot_be_replaced_and_gives_a_clear_refusal_not_a_crash(): void
    {
        [$product, $order] = $this->deliveredOrder();
        Sanctum::actingAs($this->customer);
        $payload = ['order_id' => $order->id, 'product_id' => $product->id, 'rating' => 1, 'content' => 'Not good at all.'];
        $id = $this->postJson('/api/customer/reviews', $payload)->json('id');
        Review::find($id)->delete(); // what an admin removal does (soft delete)

        $this->postJson('/api/customer/reviews', $payload)->assertStatus(422);
    }

    public function test_nobody_can_edit_or_delete_another_customers_review(): void
    {
        [$product, $order] = $this->deliveredOrder();
        Sanctum::actingAs($this->customer);
        $id = $this->postJson('/api/customer/reviews', [
            'order_id' => $order->id, 'product_id' => $product->id, 'rating' => 5, 'content' => 'Wonderful craftsmanship.',
        ])->json('id');

        Sanctum::actingAs($this->makeCustomer('stranger@example.test'));
        $this->putJson("/api/customer/reviews/{$id}", ['rating' => 1, 'content' => 'Terrible, terrible product.'])->assertNotFound();
        $this->deleteJson("/api/customer/reviews/{$id}")->assertNotFound();
        $this->assertSame(5, (int) Review::find($id)->rating);
    }

    public function test_a_review_edit_needs_a_valid_rating_and_real_text(): void
    {
        [$product, $order] = $this->deliveredOrder();
        Sanctum::actingAs($this->customer);
        $id = $this->postJson('/api/customer/reviews', [
            'order_id' => $order->id, 'product_id' => $product->id, 'rating' => 5, 'content' => 'Wonderful craftsmanship.',
        ])->json('id');

        $this->putJson("/api/customer/reviews/{$id}", ['rating' => 9])->assertStatus(422);
        $this->putJson("/api/customer/reviews/{$id}", ['content' => 'short'])->assertStatus(422);
    }
}
