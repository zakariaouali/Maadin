<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusChangedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    // $status is one of: confirmed, shipped, delivered, cancelled
    public function __construct(
        public Order $order,
        public string $status,
        public ?string $trackingNumber = null,
        public string $userLocale = 'en',
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'confirmed' => [
                'en' => 'Order confirmed — ' . $this->order->order_number,
                'fr' => 'Commande confirmée — ' . $this->order->order_number,
                'ar' => 'تم تأكيد الطلب — ' . $this->order->order_number,
            ],
            'shipped' => [
                'en' => 'Order shipped — ' . $this->order->order_number,
                'fr' => 'Commande expédiée — ' . $this->order->order_number,
                'ar' => 'تم شحن الطلب — ' . $this->order->order_number,
            ],
            'delivered' => [
                'en' => 'Order delivered — ' . $this->order->order_number,
                'fr' => 'Commande livrée — ' . $this->order->order_number,
                'ar' => 'تم تسليم الطلب — ' . $this->order->order_number,
            ],
            'cancelled' => [
                'en' => 'Order cancelled — ' . $this->order->order_number,
                'fr' => 'Commande annulée — ' . $this->order->order_number,
                'ar' => 'تم إلغاء الطلب — ' . $this->order->order_number,
            ],
        ];

        $forStatus = $subjects[$this->status] ?? $subjects['confirmed'];

        return new Envelope(
            subject: $forStatus[$this->userLocale] ?? $forStatus['en'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-status-changed',
            with: [
                'order'          => $this->order,
                'status'         => $this->status,
                'trackingNumber' => $this->trackingNumber,
                'locale'         => $this->userLocale,
                'siteUrl'        => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
