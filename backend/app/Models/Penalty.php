<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penalty extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id', 'admin_id', 'reason', 'description', 'penalty_type',
        'duration_days', 'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}