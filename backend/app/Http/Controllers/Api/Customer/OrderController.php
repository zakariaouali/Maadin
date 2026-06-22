<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['items', 'seller:id,store_name,store_slug'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, string $id)
    {
        $order = $request->user()->orders()
            ->with(['items.product:id,slug', 'seller:id,store_name,store_slug'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function cancel(Request $request, string $id)
    {
        $order = $request->user()->orders()->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending orders can be cancelled by the customer.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $product = $item->product()->lockForUpdate()->first();
                if ($product) {
                    $product->increment('stock_quantity', $item->quantity);
                    $product->decrement('total_sales', $item->quantity);
                }
            }

            $order->update(['status' => 'cancelled']);
        });

        return response()->json($order->fresh());
    }
}