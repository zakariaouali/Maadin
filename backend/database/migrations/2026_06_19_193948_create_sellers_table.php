<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('store_name');
            $table->string('store_slug')->unique();
            $table->text('store_description')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('banner_path')->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->enum('status', ['pending', 'verified', 'suspended'])->default('pending');
            $table->enum('level', ['bronze', 'silver', 'gold', 'verified_artisan'])->default('bronze');
            $table->unsignedInteger('total_orders')->default(0);
            $table->unsignedInteger('response_time_hours')->nullable();
            $table->text('bank_account_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('phone_number', 20);
            $table->timestamps();
            $table->softDeletes();

            $table->index('store_slug');
            $table->index('status');
            $table->index('level');
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sellers');
    }
};