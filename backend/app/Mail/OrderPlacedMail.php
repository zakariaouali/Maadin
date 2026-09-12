<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPlacedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $userLocale = 'en',
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'en' => 'Order confirmed — ' . $this->order->order_number,
            'fr' => 'Commande confirmée — ' . $this->order->order_number,
            'ar' => 'تم تأكيد الطلب — ' . $this->order->order_number,
        ];

        return new Envelope(
            subject: $subjects[$this->userLocale] ?? $subjects['en'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-placed',
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
