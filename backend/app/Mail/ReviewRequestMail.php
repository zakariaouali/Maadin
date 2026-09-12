<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReviewRequestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $userLocale = 'en',
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'en' => 'How was your order?',
            'fr' => 'Comment était votre commande ?',
            'ar' => 'كيف كان طلبك؟',
        ];

        return new Envelope(
            subject: $subjects[$this->userLocale] ?? $subjects['en'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.review-request',
            with: [
                'order'   => $this->order,
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
