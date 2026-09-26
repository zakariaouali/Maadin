<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// Admin alert: someone signed up for, or asked to move to, a plan where our
// team sets up the store (managed / premium).
class SellerPlanRequestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $sellerName,
        public string $sellerEmail,
        public string $plan,
        public bool $isUpgrade = false,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'طلب باقة ' . ucfirst($this->plan) . ' — ' . $this->sellerName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.seller-plan-request',
            with: [
                'sellerName'  => $this->sellerName,
                'sellerEmail' => $this->sellerEmail,
                'plan'        => ucfirst($this->plan),
                'isUpgrade'   => $this->isUpgrade,
                'siteUrl'     => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
