<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE sellers MODIFY COLUMN status ENUM('pending','verified','suspended','upgrade_pending','suspended_subscription') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("UPDATE sellers SET status = 'suspended' WHERE status IN ('upgrade_pending','suspended_subscription')");
        DB::statement("ALTER TABLE sellers MODIFY COLUMN status ENUM('pending','verified','suspended') NOT NULL DEFAULT 'pending'");
    }
};
