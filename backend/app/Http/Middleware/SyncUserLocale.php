<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SyncUserLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('X-Locale');

        if ($locale && in_array($locale, ['en', 'fr', 'ar'])) {
            $user = $request->user();
            if ($user && $user->locale !== $locale) {
                $user->update(['locale' => $locale]);
            }
        }

        return $next($request);
    }
}
