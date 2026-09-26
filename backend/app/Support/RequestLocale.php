<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Which language should this request's response be in?
 *
 * Server-rendered pages pass ?locale=xx explicitly. Browser requests from the
 * site (forms, dropdowns, dashboards) don't, but the frontend sends the
 * current language in an X-Locale header on every call. Reading only the query
 * string meant every such call was answered in English, so category names in
 * product forms ignored the language the visitor had chosen.
 */
class RequestLocale
{
    public const SUPPORTED = ['en', 'fr', 'ar'];

    public static function from(Request $request): string
    {
        foreach ([$request->query('locale'), $request->header('X-Locale')] as $candidate) {
            if (is_string($candidate) && in_array($candidate, self::SUPPORTED, true)) {
                return $candidate;
            }
        }

        return 'en';
    }
}
