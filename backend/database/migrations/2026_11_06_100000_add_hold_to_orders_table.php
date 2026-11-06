<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // "En attente": the team has paused the order (e.g. the customer must be called first).
            // It is a flag next to the status, not a status, so the normal flow is untouched.
            $table->boolean('on_hold')->default(false)->after('status');
            $table->string('hold_reason', 255)->nullable()->after('on_hold');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['on_hold', 'hold_reason']);
        });
    }
};
