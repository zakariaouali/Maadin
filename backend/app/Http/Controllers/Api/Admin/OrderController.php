<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['customer:id,name,email', 'seller:id,store_name']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($orders);
    }

    public function show(string $id)
    {
        $order = Order::with(['customer:id,name,email,phone', 'seller:id,store_name', 'items'])
            ->findOrFail($id);

        return response()->json($order);
    }
}