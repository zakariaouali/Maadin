<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// Deliberately NOT ShouldQueue: this is sent from a console command (via
// Coolify's scheduled task cron), not a web request, so there's no
// request/response to keep fast. Sending synchronously also avoids a real
// bug: the caller deletes the temp file right after send() returns, which
// would break a queued job trying to read it later from a worker.
class DatabaseBackupMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $filePath,
        public string $fileName,
        public float $sizeKb,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Database backup — ' . now()->format('Y-m-d'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.database-backup',
            with: [
                'fileName' => $this->fileName,
                'sizeKb'   => $this->sizeKb,
                'date'     => now()->format('F j, Y \a\t H:i'),
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath($this->filePath)
                ->as($this->fileName)
                ->withMime('application/gzip'),
        ];
    }
}
