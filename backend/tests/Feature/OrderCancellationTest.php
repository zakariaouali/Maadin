<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsShop;
use Tests\TestCase;

class OrderCancellationTest extends TestCase
{
    use RefreshDatabase, BuildsShop;

    /** Place a real order through the API and return [customer, seller, product, order]. */
    private function placeOrder(array $productAttrs = [], int $quantity = 2): array
    {
        $seller = $this->makeSeller();
        $product = $this->makeProduct($seller, $productAttrs + ['stock_quantity' => 5]);
        $customer = $this->makeCustomer();
        Sanctum::actingAs($customer);

        $this->postJson('/api/customer/checkout', $this->checkoutPayload([
            ['product_id' => $product->id, 'quantity' => $quantity],
        ]))->assertCreated();

        return [$customer, $seller, $product, Order::firstOrFail()];
    }

    public function test_cancelling_a_pending_order_puts_the_stock_back(): void
    {
        [, , $product, $order] = $this->placeOrder();
        $this->assertSame(3, $product->fresh()->stock_quantity);

        $this->putJson("/api/customer/orders/{$order->id}/cancel")
            ->assertOk()->assertJsonPath('status', 'cancelled');

        $this->assertSame(5, $product->fresh()->stock_quantity);
        $this->assertSame(0, $product->fresh()->total_sales);
    }

    public function test_cancelling_tells_the_seller(): void
    {
        [, $seller, , $order] = $this->placeOrder();

        $this->putJson("/api/customer/orders/{$order->id}/cancel")->assertOk();

        $note = Notification::where('user_id', $seller->user_id)->where('title', 'like', '%cancelled%')->first();
        $this->assertNotNull($note, 'the seller should get a notification');
        $this->assertStringContainsString($order->order_number, $note->body);
    }

    public function test_cancelling_twice_gives_the_stock_back_only_once(): void
    {
        [, , $product, $order] = $this->placeOrder();

        $this->putJson("/api/customer/orders/{$order->id}/cancel")->assertOk();
        $this->putJson("/api/customer/orders/{$order->id}/cancel")->assertStatus(422);

        $this->assertSame(5, $product->fresh()->stock_quantity);   // not 7
    }

    public function test_cancelling_a_made_to_order_item_does_not_invent_stock(): void
    {
        [, , $product, $order] = $this->placeOrder(['stock_quantity' => 0, 'is_made_to_order' => true], 3);

        $this->putJson("/api/customer/orders/{$order->id}/cancel")->assertOk();

        $this->assertSame(0, $product->fresh()->stock_quantity);
        $this->assertSame(0, $product->fresh()->total_sales);
    }

    public function test_an_order_that_is_no_longer_pending_cannot_be_cancelled_by_the_customer(): void
    {
        [, , $product, $order] = $this->placeOrder();
        $order->update(['status' => 'shipped']);

        $this->putJson("/api/customer/orders/{$order->id}/cancel")->assertStatus(422);

        $this->assertSame('shipped', $order->fresh()->status);
        $this->assertSame(3, $product->fresh()->stock_quantity);
    }

    public function test_another_customer_cannot_see_or_cancel_my_order(): void
    {
        [, , , $order] = $this->placeOrder();
        Sanctum::actingAs($this->makeCustomer('stranger@example.test'));

        $this->getJson("/api/customer/orders/{$order->id}")->assertNotFound();
        $this->putJson("/api/customer/orders/{$order->id}/cancel")->assertNotFound();
        $this->assertSame('pending', $order->fresh()->status);
    }

    public function test_the_seller_cancelling_also_restores_stock_but_not_for_made_to_order(): void
    {
        [, $seller, $product, $order] = $this->placeOrder();
        Sanctum::actingAs($seller->user);

        $this->putJson("/api/seller/orders/{$order->id}/status", ['status' => 'cancelled'])->assertOk();

        $this->assertSame(5, $product->fresh()->stock_quantity);
    }
}
