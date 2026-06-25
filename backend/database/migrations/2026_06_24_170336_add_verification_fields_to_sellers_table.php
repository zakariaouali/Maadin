<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->text('seller_bio')->nullable()->after('store_description');
            $table->string('shop_photo_path')->nullable()->after('seller_bio');
            $table->json('portfolio_paths')->nullable()->after('shop_photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn(['seller_bio', 'shop_photo_path', 'portfolio_paths']);
        });
    }
};
