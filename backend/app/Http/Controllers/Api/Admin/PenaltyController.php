<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Penalty;
use Illuminate\Http\Request;

class PenaltyController extends Controller
{
    public function index(Request $request)
    {
        $query = Penalty::with(['seller:id,store_name', 'admin:id,name']);

        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        $penalties = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($penalties);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'seller_id' => 'required|exists:sellers,id',
            'reason' => 'required|in:fake_stock,delayed_order,bad_behavior,other',
            'description' => 'required|string',
            'penalty_type' => 'required|in:warning,suspension,ban',
            'duration_days' => 'nullable|integer|min:1',
        ]);

        $validated['admin_id'] = $request->user()->id;

        if (!empty($validated['duration_days'])) {
            $validated['expires_at'] = now()->addDays($validated['duration_days']);
        }

        $penalty = Penalty::create($validated);

        // Apply immediate effect for suspension/ban
        $seller = \App\Models\Seller::find($validated['seller_id']);
        if ($validated['penalty_type'] === 'suspension') {
            $seller->update(['status' => 'suspended']);
        } elseif ($validated['penalty_type'] === 'ban') {
            $seller->update(['status' => 'suspended']);
            $seller->user->update(['status' => 'banned']);
        }

        return response()->json($penalty, 201);
    }
}