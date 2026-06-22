<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\IdempotencyKey;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'idempotency_key' => 'required|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string|max:255',
            'shipping_city' => 'required|string|max:100',
            'shipping_phone' => 'required|string|max:20',
            'shipping_postal_code' => 'nullable|string|max:10',
            'notes' => 'nullable|string',
        ]);

        $userId = $request->user()->id;
        $key = $validated['idempotency_key'];

        // If we've already processed this exact key, return the cached result
        $existing = IdempotencyKey::where('key', $key)->where('user_id', $userId)->first();
        if ($existing) {
            return response()->json($existing->response, 201);
        }

        $orders = DB::transaction(function () use ($validated, $request, $key, $userId) {
            $createdOrders = [];
            $itemsBySeller = [];

            foreach ($validated['items'] as $cartItem) {
                $product = Product::where('id', $cartItem['product_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$product || !$product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => "A product in your cart is no longer available.",
                    ]);
                }

                if ($product->seller->status !== 'verified') {
                    throw ValidationException::withMessages([
                        'items' => "\"{$product->name}\" is no longer available.",
                    ]);
                }

                if ($product->stock_quantity < $cartItem['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Only {$product->stock_quantity} left of \"{$product->name}\".",
                    ]);
                }

                $itemsBySeller[$product->seller_id][] = [
                    'product' => $product,
                    'quantity' => $cartItem['quantity'],
                ];
            }

            foreach ($itemsBySeller as $sellerId => $items) {
                $total = collect($items)->sum(fn($i) => $i['product']->price * $i['quantity']);

                $order = Order::create([
                    'customer_id' => $userId,
                    'seller_id' => $sellerId,
                    'order_number' => 'ORD-' . now()->format('Y') . '-' . str_pad((string) (Order::max('id') + 1), 6, '0', STR_PAD_LEFT),
                    'status' => 'pending',
                    'total_price' => $total,
                    'shipping_address' => $validated['shipping_address'],
                    'shipping_city' => $validated['shipping_city'],
                    'shipping_phone' => $validated['shipping_phone'],
                    'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
                    'payment_method' => 'cash',
                    'payment_status' => 'pending',
                    'notes' => $validated['notes'] ?? null,
                ]);

                foreach ($items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product']->id,
                        'seller_id' => $sellerId,
                        'quantity' => $item['quantity'],
                        'price_at_purchase' => $item['product']->price,
                        'product_name' => $item['product']->name,
                    ]);

                    $item['product']->decrement('stock_quantity', $item['quantity']);
                    $item['product']->increment('total_sales', $item['quantity']);
                }

                $createdOrders[] = $order->load('items');
            }

            // Record the idempotency key with the response, inside the same transaction
            IdempotencyKey::create([
                'key' => $key,
                'user_id' => $userId,
                'response' => $createdOrders,
            ]);

            return $createdOrders;
        });

        return response()->json($orders, 201);
    }
}