<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        $revenueByMonth = Order::where('payment_status', 'received')
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total_price) as total')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $recentOrders = Order::with(['customer:id,name', 'seller:id,store_name'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get(['id', 'customer_id', 'seller_id', 'status', 'total_price', 'created_at']);

        $recentConversations = Conversation::with(['buyer:id,name,avatar_path', 'product:id,name'])
            ->withCount(['messages as unread_count' => fn($q) => $q->where('is_read', false)])
            ->orderBy('last_message_at', 'desc')
            ->limit(5)
            ->get();

        $topSellers = Seller::withCount('orders')
            ->withSum(['orders' => fn($q) => $q->where('payment_status', 'received')], 'total_price')
            ->orderByDesc('orders_sum_total_price')
            ->limit(5)
            ->get(['id', 'store_name', 'store_slug', 'status']);

        return response()->json([
            'total_users'       => User::count(),
            'total_customers'   => User::where('role', 'customer')->count(),
            'total_sellers'     => User::where('role', 'seller')->count(),
            'pending_sellers'   => Seller::where('status', 'pending')->count(),
            'verified_sellers'  => Seller::where('status', 'verified')->count(),
            'total_products'    => Product::count(),
            'active_products'   => Product::where('is_active', true)->count(),
            'pending_products'  => Product::where('is_approved', false)->count(),
            'total_orders'      => Order::count(),
            'pending_orders'    => Order::where('status', 'pending')->count(),
            'delivered_orders'  => Order::where('status', 'delivered')->count(),
            'total_revenue'     => Order::where('payment_status', 'received')->sum('total_price'),
            'revenue_by_month'  => $revenueByMonth,
            'orders_by_status'  => $ordersByStatus,
            'recent_orders'          => $recentOrders,
            'top_sellers'            => $topSellers,
            'recent_conversations'   => $recentConversations,
            'unread_messages'        => Message::where('is_read', false)->count(),
            'processing_orders'      => Order::whereIn('status', ['pending', 'confirmed'])->count(),
        ]);
    }
}
