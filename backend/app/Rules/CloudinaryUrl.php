<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Accepts only image URLs served from OUR Cloudinary account.
 *
 * Sellers can send image URLs directly (the browser uploads to Cloudinary and
 * passes the result on). Without this check anyone could point a product,
 * logo or avatar at any external address: broken images that crash pages
 * using next/image, tracking pixels, or hosts we do not control.
 */
class CloudinaryUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $parts = is_string($value) ? parse_url($value) : false;

        $valid = $parts
            && ($parts['scheme'] ?? '') === 'https'
            && ($parts['host'] ?? '') === 'res.cloudinary.com'
            && empty($parts['user']) && empty($parts['port'])
            && $this->pathBelongsToOurAccount($parts['path'] ?? '');

        if (!$valid) {
            $fail('The :attribute must be an image uploaded through the site.');
        }
    }

    private function pathBelongsToOurAccount(string $path): bool
    {
        // CLOUDINARY_URL=cloudinary://key:secret@CLOUD_NAME
        $ours = parse_url((string) env('CLOUDINARY_URL'), PHP_URL_HOST);

        // Optional extra account names (comma separated), for the case where
        // the browser-side upload preset lives in a different account.
        $extra = array_filter(array_map('trim', explode(',', (string) env('CLOUDINARY_ALLOWED_CLOUDS'))));

        $allowed = array_values(array_filter([$ours, ...$extra]));

        // Without any configured account name (e.g. local tooling), fall back to
        // "any Cloudinary path" rather than rejecting every upload.
        if (!$allowed) {
            return str_starts_with($path, '/');
        }

        foreach ($allowed as $cloud) {
            if (str_starts_with($path, '/' . $cloud . '/')) {
                return true;
            }
        }

        return false;
    }
}
