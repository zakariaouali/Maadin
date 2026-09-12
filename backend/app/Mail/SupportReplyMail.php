<?php

namespace App\Mail;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SupportReplyMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public SupportTicket $ticket,
        public string $userLocale = 'en',
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'en' => 'We replied to your support request',
            'fr' => 'Nous avons répondu à votre demande',
            'ar' => 'لقد قمنا بالرد على طلبك',
        ];

        return new Envelope(
            subject: $subjects[$this->userLocale] ?? $subjects['en'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.support-reply',
            with: [
                'ticket'  => $this->ticket,
                'locale'  => $this->userLocale,
                'siteUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
