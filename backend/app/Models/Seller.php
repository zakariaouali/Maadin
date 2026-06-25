<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Seller extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'store_name', 'store_slug', 'store_description',
        'seller_bio', 'shop_photo_path', 'portfolio_paths',
        'logo_path', 'banner_path', 'rating', 'total_reviews', 'status',
        'level', 'total_orders', 'response_time_hours', 'bank_account_number',
        'bank_name', 'phone_number',
    ];

    protected $casts = [
        'rating'           => 'decimal:2',
        'portfolio_paths'  => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function penalties()
    {
        return $this->hasMany(Penalty::class);
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }
}