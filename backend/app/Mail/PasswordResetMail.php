<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $resetUrl,
        public string $userLocale = 'en',
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'en' => 'Reset your Marrakech Maadine password',
            'fr' => 'Réinitialisez votre mot de passe Marrakech Maadine',
            'ar' => 'إعادة تعيين كلمة مرور مراكش معدن',
        ];

        return new Envelope(
            subject: $subjects[$this->userLocale] ?? $subjects['en'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset',
            with: [
                'userName' => $this->userName,
                'resetUrl' => $this->resetUrl,
                'locale'   => $this->userLocale,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
