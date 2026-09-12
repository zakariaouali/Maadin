<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewSellerRegisteredMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $storeName,
        public string $sellerName,
        public string $sellerEmail,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'بائع جديد سجّل متجراً — ' . $this->storeName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.new-seller',
            with: [
                'storeName'   => $this->storeName,
                'sellerName'  => $this->sellerName,
                'sellerEmail' => $this->sellerEmail,
                'siteUrl'     => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
