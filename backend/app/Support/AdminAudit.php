<?php

namespace App\Support;

use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

/** One line in the admin audit log: who did what to which record, from where. */
class AdminAudit
{
    public static function record(Request $request, string $action, string $subjectType, int $subjectId, array $changes = []): void
    {
        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'changes' => $changes,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
