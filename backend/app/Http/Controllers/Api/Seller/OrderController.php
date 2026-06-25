<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;
        abort_if(!$seller, 404, 'No store found for this account.');

        $orders = $seller->orders()
            ->with(['items', 'customer:id,name,phone'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, string $id)
    {
        $seller = $request->user()->seller;
        abort_if(!$seller, 404, 'No store found for this account.');

        $order = $seller->orders()
            ->with(['items', 'customer:id,name,phone'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function updateStatus(Request $request, string $id)
    {
        $seller = $request->user()->seller;
        abort_if(!$seller, 404, 'No store found for this account.');

        $order = $seller->orders()->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:confirmed,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $allowedTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['shipped', 'cancelled'],
            'shipped' => ['delivered'],
            'delivered' => [],
            'cancelled' => [],
        ];

        if (!in_array($validated['status'], $allowedTransitions[$order->status] ?? [])) {
            return response()->json([
                'message' => "Cannot change status from '{$order->status}' to '{$validated['status']}'.",
            ], 422);
        }

        DB::transaction(function () use ($order, $validated, $seller) {
            $updateData = ['status' => $validated['status']];

            if (isset($validated['tracking_number'])) {
                $updateData['tracking_number'] = $validated['tracking_number'];
            }
            if ($validated['status'] === 'shipped') {
                $updateData['shipped_at'] = now();
            }
            if ($validated['status'] === 'delivered') {
                $updateData['delivered_at'] = now();
                $updateData['payment_status'] = 'received';
            }
            if ($validated['status'] === 'cancelled') {
                $this->reverseStockAndSales($order);
            }

            $order->update($updateData);

            if ($validated['status'] === 'delivered') {
                $seller->increment('total_orders');
            }
        });

        return response()->json($order->fresh()->load(['items', 'customer:id,name,phone']));
    }

    private function reverseStockAndSales(Order $order): void
    {
        foreach ($order->items as $item) {
            $product = $item->product()->lockForUpdate()->first();
            if ($product) {
                $product->increment('stock_quantity', $item->quantity);
                $product->decrement('total_sales', $item->quantity);
            }
        }
    }
}