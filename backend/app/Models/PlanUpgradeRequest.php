<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanUpgradeRequest extends Model
{
    protected $fillable = ['user_id', 'from_plan', 'to_plan', 'status', 'admin_notes'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
