<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

// Login already refuses suspended/banned accounts, but a session opened before
// the ban stayed valid. Check the status on every authenticated request so a
// ban or suspension takes effect immediately.
class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status !== 'active') {
            Auth::guard('web')->logout();
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json([
                'message' => $user->status === 'banned'
                    ? 'Account has been banned'
                    : 'Account has been suspended',
            ], 403);
        }

        return $next($request);
    }
}
