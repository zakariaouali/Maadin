<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // On Windows, PHP's cURL often lacks a CA bundle. Point Guzzle at ours.
        $cacert = base_path('cacert.pem');
        if (file_exists($cacert)) {
            putenv("CURL_CA_BUNDLE={$cacert}");
            putenv("SSL_CERT_FILE={$cacert}");
        }

        // Sign-in: a per-IP limit alone lets someone hammer ONE account from
        // many addresses, so also limit by the email being tried.
        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(5)->by('login-account|' . strtolower((string) $request->input('email'))),
            Limit::perMinute(20)->by('login-ip|' . $request->ip()),
        ]);

        // "Forgot password" sends an email, so without a per-address limit anyone
        // could flood a victim's inbox with reset links.
        RateLimiter::for('password-reset', fn (Request $request) => [
            Limit::perMinutes(10, 3)->by('reset-account|' . strtolower((string) $request->input('email'))),
            Limit::perMinute(10)->by('reset-ip|' . $request->ip()),
        ]);
    }
}
