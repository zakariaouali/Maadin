<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /** Everything the team did, newest first, with filters. */
    public function index(Request $request)
    {
        $query = AdminAuditLog::with('admin:id,name');

        if ($request->filled('action')) {
            $query->where('action', $request->string('action'));
        }
        if ($request->filled('subject_type')) {
            $query->where('subject_type', $request->string('subject_type'));
        }
        if ($request->integer('admin_id') > 0) {
            $query->where('admin_id', $request->integer('admin_id'));
        }
        if ($request->integer('subject_id') > 0) {
            $query->where('subject_id', $request->integer('subject_id'));
        }
        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->date('from')->startOfDay());
        }
        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->date('to')->endOfDay());
        }

        $logs = $query->orderByDesc('id')->paginate(25)->toArray();

        // What the filter drop-downs can offer
        $logs['filters'] = [
            'actions' => AdminAuditLog::query()->distinct()->orderBy('action')->pluck('action'),
            'subject_types' => AdminAuditLog::query()->distinct()->orderBy('subject_type')->pluck('subject_type'),
        ];

        return response()->json($logs);
    }
}
