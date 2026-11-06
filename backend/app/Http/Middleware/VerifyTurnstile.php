<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cloudflare Turnstile: a free "are you a human" check. It only runs once TURNSTILE_SECRET is set,
 * so the site works the same before and after the keys are added. If Cloudflare cannot be reached
 * the request is refused (closed), because the whole point is to keep bots out.
 */
class VerifyTurnstile
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.turnstile.secret');
        if (!$secret) {
            return $next($request);
        }

        $token = (string) $request->input('turnstile_token', '');
        $passed = false;

        if ($token !== '') {
            try {
                $answer = Http::asForm()->timeout(5)->post(self::VERIFY_URL, [
                    'secret' => $secret,
                    'response' => $token,
                    'remoteip' => $request->ip(),
                ]);
                $passed = (bool) $answer->json('success');
            } catch (\Throwable $e) {
                report($e);
            }
        }

        if (!$passed) {
            return response()->json(['message' => __('Verification failed. Please try again.')], 422);
        }

        return $next($request);
    }
}
