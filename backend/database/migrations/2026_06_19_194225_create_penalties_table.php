<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('sellers')->onDelete('cascade');
            $table->foreignId('admin_id')->constrained('users')->onDelete('restrict');
            $table->enum('reason', ['fake_stock', 'delayed_order', 'bad_behavior', 'other']);
            $table->text('description');
            $table->enum('penalty_type', ['warning', 'suspension', 'ban']);
            $table->unsignedInteger('duration_days')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('seller_id');
            $table->index('expires_at');
            $table->index('penalty_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penalties');
    }
};