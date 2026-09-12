<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $userLocale = 'en',
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'en' => 'New order received — ' . $this->order->order_number,
            'fr' => 'Nouvelle commande — ' . $this->order->order_number,
            'ar' => 'طلب جديد — ' . $this->order->order_number,
        ];

        return new Envelope(
            subject: $subjects[$this->userLocale] ?? $subjects['en'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-received',
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
