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
        Schema::table('users', function (Blueprint $table) {
            $table->date('subscription_expires_at')->nullable()->after('plan');
            $table->decimal('monthly_fee', 10, 2)->nullable()->after('subscription_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['subscription_expires_at', 'monthly_fee']);
        });
    }
};
