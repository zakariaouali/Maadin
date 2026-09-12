<?php

namespace App\Support;

use RuntimeException;

class AdminNotifier
{
    // Returns the fixed admin notification inbox, or throws a clear
    // config error instead of silently sending admin alerts to nobody.
    public static function email(): string
    {
        $email = config('mail.admin_notification_email');

        if (!$email) {
            throw new RuntimeException(
                'ADMIN_NOTIFICATION_EMAIL is not configured — admin alert emails cannot be sent.'
            );
        }

        return $email;
    }
}
