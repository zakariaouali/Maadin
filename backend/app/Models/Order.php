<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Schema;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id', 'seller_id', 'order_number', 'status', 'on_hold', 'hold_reason', 'total_price',
        'shipping_address', 'shipping_city', 'shipping_phone', 'shipping_postal_code',
        'payment_method', 'payment_status', 'notes', 'tracking_number',
        'shipped_at', 'delivered_at', 'confirmed_at', 'cancelled_at',
    ];

    // The hold reason is an internal note for the team: never sent to customers or sellers.
    // The admin screens opt in with makeVisible('hold_reason').
    protected $hidden = ['hold_reason'];

    protected $casts = [
        'total_price' => 'decimal:2',
        'on_hold' => 'boolean',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Whether the confirmed_at / cancelled_at columns exist yet. Lets the new code run safely in the
     * gap between a deploy and its migration instead of failing every status change.
     */
    public static function hasStatusDates(): bool
    {
        static $has = null;

        return $has ??= Schema::hasColumn('orders', 'confirmed_at');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}