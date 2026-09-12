<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * support_tickets.role was created as enum('customer','seller','guest'),
     * missing 'admin' even though users.role allows it — any admin account
     * submitting a ticket fails with "Data truncated for column 'role'".
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE support_tickets MODIFY role ENUM('customer', 'seller', 'admin', 'guest') NOT NULL DEFAULT 'guest'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE support_tickets MODIFY role ENUM('customer', 'seller', 'guest') NOT NULL DEFAULT 'guest'");
    }
};
