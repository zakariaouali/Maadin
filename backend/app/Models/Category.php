<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'name_fr', 'name_ar', 'slug', 'description', 'icon_path', 'parent_id', 'display_order', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * The category's own id plus its sub-categories' ids. Choosing a parent
     * ("Woodwork") must also show products filed under its children
     * ("Carved Cedar"); an exact-id filter used to hide them.
     */
    public static function idsIncludingChildren(int $id): array
    {
        return array_merge([$id], static::where('parent_id', $id)->pluck('id')->all());
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}