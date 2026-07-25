<?php

namespace App\Providers;

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
    }
}
