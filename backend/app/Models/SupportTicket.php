<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    protected $fillable = [
        'user_id', 'guest_name', 'guest_email', 'role',
        'category', 'subject', 'message',
        'status', 'priority',
        'admin_reply', 'replied_by', 'replied_at', 'admin_notes', 'user_read_at',
    ];

    protected $casts = [
        'replied_at'   => 'datetime',
        'user_read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function repliedBy()
    {
        return $this->belongsTo(User::class, 'replied_by');
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->user?->name ?? $this->guest_name ?? 'Guest';
    }

    public function getDisplayEmailAttribute(): string
    {
        return $this->user?->email ?? $this->guest_email ?? '';
    }
}
