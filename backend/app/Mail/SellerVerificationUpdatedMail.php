<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SellerVerificationUpdatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    // $status is one of: verified, suspended
    public function __construct(
        public string $sellerName,
        public string $storeName,
        public string $status,
        public string $userLocale = 'en',
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'verified' => [
                'en' => 'Your store is verified — ' . $this->storeName,
                'fr' => 'Votre boutique est vérifiée — ' . $this->storeName,
                'ar' => 'تم توثيق متجرك — ' . $this->storeName,
            ],
            'suspended' => [
                'en' => 'Your store has been suspended — ' . $this->storeName,
                'fr' => 'Votre boutique a été suspendue — ' . $this->storeName,
                'ar' => 'تم تعليق متجرك — ' . $this->storeName,
            ],
        ];

        $forStatus = $subjects[$this->status] ?? $subjects['verified'];

        return new Envelope(
            subject: $forStatus[$this->userLocale] ?? $forStatus['en'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.seller-verification-updated',
            with: [
                'sellerName' => $this->sellerName,
                'storeName'  => $this->storeName,
                'status'     => $this->status,
                'locale'     => $this->userLocale,
                'siteUrl'    => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
