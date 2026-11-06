<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderStatusService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function pending(Request $request)
    {
        $seller = $request->user()->seller;
        abort_if(!$seller, 404);
        $count = Order::where('seller_id', $seller->id)->where('status', 'pending')->count();
        return response()->json(['count' => $count]);
    }

    public function index(Request $request)
    {
        $seller = $request->user()->seller;
        abort_if(!$seller, 404, __('No store found for this account.'));

        $orders = $seller->orders()
            ->with(['items.product:id,slug', 'items.product.primaryImage:id,product_id,image_path', 'customer:id,name,phone'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, string $id)
    {
        $seller = $request->user()->seller;
        abort_if(!$seller, 404, __('No store found for this account.'));

        $order = $seller->orders()
            ->with(['items.product:id,slug', 'items.product.primaryImage:id,product_id,image_path', 'customer:id,name,phone'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function updateStatus(Request $request, string $id, OrderStatusService $statuses)
    {
        $seller = $request->user()->seller;
        abort_if(!$seller, 404, __('No store found for this account.'));

        $order = $seller->orders()->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:confirmed,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $order = $statuses->change($order, $validated['status'], $validated['tracking_number'] ?? null);

        return response()->json($order->load(['items.product:id,slug', 'items.product.primaryImage:id,product_id,image_path', 'customer:id,name,phone']));
    }
}
