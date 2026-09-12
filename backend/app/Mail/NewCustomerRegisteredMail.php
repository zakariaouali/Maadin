<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewCustomerRegisteredMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $customerEmail,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'عميل جديد سجّل في المنصة — ' . $this->customerName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.new-customer',
            with: [
                'customerName'  => $this->customerName,
                'customerEmail' => $this->customerEmail,
                'siteUrl'       => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
