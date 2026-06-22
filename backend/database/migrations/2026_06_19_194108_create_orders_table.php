<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('seller_id')->constrained('sellers')->onDelete('restrict');
            $table->string('order_number', 50)->unique();
            $table->enum('status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->decimal('total_price', 10, 2);
            $table->string('shipping_address');
            $table->string('shipping_city', 100);
            $table->string('shipping_phone', 20);
            $table->string('shipping_postal_code', 10)->nullable();
            $table->enum('payment_method', ['cash', 'card'])->default('cash');
            $table->enum('payment_status', ['pending', 'received'])->default('pending');
            $table->text('notes')->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('customer_id');
            $table->index('seller_id');
            $table->index('status');
            $table->index('created_at');
            $table->index('shipped_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};