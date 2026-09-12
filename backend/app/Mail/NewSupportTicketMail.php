<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewSupportTicketMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $fromName,
        public string $fromEmail,
        public string $category,
        public string $ticketSubject,
        public string $message,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تذكرة دعم جديدة — ' . $this->ticketSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.new-support-ticket',
            with: [
                'fromName'  => $this->fromName,
                'fromEmail' => $this->fromEmail,
                'category'  => $this->category,
                'subject'   => $this->ticketSubject,
                'ticketMessage' => $this->message,
                'siteUrl'   => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
