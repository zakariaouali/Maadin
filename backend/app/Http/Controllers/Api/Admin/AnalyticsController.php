<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'total_sellers' => User::where('role', 'seller')->count(),
            'pending_sellers' => Seller::where('status', 'pending')->count(),
            'verified_sellers' => Seller::where('status', 'verified')->count(),
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'total_revenue' => Order::where('payment_status', 'received')->sum('total_price'),
        ]);
    }
}