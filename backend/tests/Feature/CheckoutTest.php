<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsShop;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase, BuildsShop;

    public function test_checkout_creates_the_order_and_takes_stock_and_price_from_the_database(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller, ['price' => 250, 'stock_quantity' => 5]);
        Sanctum::actingAs($this->makeCustomer());

        $response = $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => 2],
        ]));

        $response->assertCreated();
        $order = Order::first();
        $this->assertSame('500.00', $order->total_price);          // 2 x 250, never from the browser
        $this->assertSame('pending', $order->status);
        $this->assertStringStartsWith('ORD-', $order->order_number);
        $this->assertSame(3, $product->fresh()->stock_quantity);
        $this->assertSame(2, $product->fresh()->total_sales);
    }

    public function test_checkout_refuses_more_than_the_stock_and_changes_nothing(): void
    {
        $product = $this->makeProduct($this->makeSeller(), ['stock_quantity' => 2]);
        Sanctum::actingAs($this->makeCustomer());

        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => 3],
        ]))->assertStatus(422);

        $this->assertSame(0, Order::count());
        $this->assertSame(2, $product->fresh()->stock_quantity);
    }

    public function test_the_same_product_on_two_lines_is_checked_against_the_total(): void
    {
        $product = $this->makeProduct($this->makeSeller(), ['stock_quantity' => 3]);
        Sanctum::actingAs($this->makeCustomer());

        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => 2],
            ['product_id' => $product->id, 'quantity' => 2],
        ]))->assertStatus(422);

        $this->assertSame(0, Order::count());
    }

    public function test_made_to_order_product_can_be_bought_at_zero_stock_and_stock_stays_zero(): void
    {
        $product = $this->makeProduct($this->makeSeller(), ['stock_quantity' => 0, 'is_made_to_order' => true]);
        Sanctum::actingAs($this->makeCustomer());

        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => 4],
        ]))->assertCreated();

        $this->assertSame(1, Order::count());
        $this->assertSame(0, $product->fresh()->stock_quantity);   // never negative, nothing to subtract
        $this->assertSame(4, $product->fresh()->total_sales);
    }

    public function test_a_normal_product_at_zero_stock_cannot_be_bought(): void
    {
        $product = $this->makeProduct($this->makeSeller(), ['stock_quantity' => 0]);
        Sanctum::actingAs($this->makeCustomer());

        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertStatus(422);
    }

    public function test_you_cannot_buy_from_your_own_store(): void
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller);
        Sanctum::actingAs($seller->user);

        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertStatus(422);
    }

    public function test_hidden_or_unapproved_products_cannot_be_bought(): void
    {
        $seller = $this->makeSeller();
        $unapproved = $this->makeProduct($seller, ['is_approved' => false]);
        $inactive = $this->makeProduct($seller, ['is_active' => false]);
        Sanctum::actingAs($this->makeCustomer());

        foreach ([$unapproved, $inactive] as $product) {
            $this->postJson('/api/customer/checkout', $this->checkoutPayload([
                ['product_id' => $product->id, 'quantity' => 1],
            ]))->assertStatus(422);
        }
        $this->assertSame(0, Order::count());
    }

    public function test_sending_the_same_idempotency_key_twice_creates_one_order(): void
    {
        $product = $this->makeProduct($this->makeSeller(), ['stock_quantity' => 5]);
        Sanctum::actingAs($this->makeCustomer());
        $payload = $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]], 'same-key');

        $this->postJson('/api/customer/checkout', $payload)->assertCreated();
        $this->postJson('/api/customer/checkout', $payload)->assertCreated();

        $this->assertSame(1, Order::count());
        $this->assertSame(4, $product->fresh()->stock_quantity);   // taken once, not twice
    }

    public function test_an_order_per_seller_is_created_when_the_cart_mixes_stores(): void
    {
        $a = $this->makeProduct($this->makeSeller('a@example.test', 'Store A'));
        $b = $this->makeProduct($this->makeSeller('b@example.test', 'Store B'));
        Sanctum::actingAs($this->makeCustomer());

        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $a->id, 'quantity' => 1],
            ['product_id' => $b->id, 'quantity' => 1],
        ]))->assertCreated();

        $this->assertSame(2, Order::count());
    }

    public function test_checkout_needs_a_logged_in_customer(): void
    {
        $product = $this->makeProduct($this->makeSeller());

        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertUnauthorized();
    }
}
