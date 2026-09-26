<?php

namespace App\Http\Middleware;

use App\Support\RequestLocale;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Answer every API call in the language the visitor picked on the site
// (sent as an X-Locale header): validation errors, "not allowed" messages and
// so on used to come back in English whatever the language of the page.
class SetApiLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale(RequestLocale::from($request));

        return $next($request);
    }
}
