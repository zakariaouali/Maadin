<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Seller;
use App\Support\NotificationMessages;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['items.product:id,slug', 'items.product.primaryImage:id,product_id,image_path', 'seller:id,store_name,store_slug'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, string $id)
    {
        $order = $request->user()->orders()
            ->with(['items.product:id,slug', 'items.product.primaryImage:id,product_id,image_path', 'seller:id,store_name,store_slug'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function cancel(Request $request, string $id)
    {
        $order = DB::transaction(function () use ($request, $id) {
            // Lock the order row first: two quick cancel requests (double click) used to
            // both pass the "pending" check and put the stock back twice.
            $order = $request->user()->orders()->lockForUpdate()->findOrFail($id);

            if ($order->status !== 'pending') {
                throw new HttpResponseException(response()->json([
                    'message' => __('Only pending orders can be cancelled by the customer.'),
                ], 422));
            }

            foreach ($order->items as $item) {
                $product = $item->product()->lockForUpdate()->first();
                if ($product) {
                    if (!$product->is_made_to_order) {
                        $product->increment('stock_quantity', $item->quantity);
                    }
                    $product->decrement('total_sales', $item->quantity);
                }
            }

            $order->update(['status' => 'cancelled'] + (Order::hasStatusDates() ? ['cancelled_at' => now()] : []));

            return $order;
        });

        // Tell the seller, who otherwise only finds out by opening the order
        $store = Seller::with('user')->find($order->seller_id);
        if ($store) {
            $locale = $store->user?->locale ?? 'en';
            [$title, $body] = NotificationMessages::get('order.cancelled_by_customer', $locale, [
                'number' => $order->order_number,
            ]);
            Notification::send($store->user_id, 'order', $title, $body, '/seller/orders/' . $order->id, ['order_id' => $order->id]);
        }

        return response()->json($order->fresh());
    }
}
