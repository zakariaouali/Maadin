# Email Notification System — Design

Date: 2026-09-12
Status: Approved for planning

## Problem

The platform currently sends no real emails (`MAIL_MAILER=log` in production — messages are only written to a log file, never delivered). This means the admin has no way to know about important platform events (e.g. a new customer registering) unless they manually check the database/dashboard. Sellers and customers similarly get no email notifications for orders, messages, or reviews — the only feedback mechanism today is the in-app notification bell (`notifications` table / `App\Models\Notification`), which requires actively being logged into the site.

## Goals

- Real, reliable email delivery for a defined set of platform events, to admin, sellers, and customers.
- Emails respect the platform's trilingual nature (EN/FR/AR, with AR as the default when no locale signal is available).
- Delivery must not block the request that triggers it (queued).
- Zero ongoing cost at current scale.

## Non-goals (v1)

- No merging with the existing in-app notification bell system — that stays as-is, unchanged.
- No user-facing "notification preferences" UI (opt out of certain emails, etc.) — everything defined here always sends.
- No automated test suite for this feature (matches the rest of the codebase, which has no automated tests yet per the README).
- No digest/summary emails (daily/weekly admin analytics, etc.) — only real-time, per-event emails.

## Provider & delivery

- **Provider:** Brevo (free forever: 300 emails/day, no credit card). Chosen over Resend (3,000/month) for the higher daily ceiling at zero cost.
- **Transport:** standard SMTP (`smtp-relay.brevo.com:587`) via Laravel's built-in `mail` SMTP driver — no new Composer package required, just config/env changes.
- **Sender domain:** the platform's own domain (`noreply@maadinemarrakech.com` or similar), verified in Brevo via SPF/DKIM DNS records added to `maadinemarrakech.com`. Chosen over Brevo's shared sending address for better deliverability and a professional appearance.
- **Queueing:** every notification implements `ShouldQueue`, using the existing `QUEUE_CONNECTION=database` setup (the `jobs`/`failed_jobs` tables already exist in the schema). **Requires a queue worker process** (`php artisan queue:work`) to actually run in both local dev and production — this does not run automatically alongside `php artisan serve` or a standard PHP-FPM/Nginx setup. In production (Coolify), this needs its own persistent process alongside the existing `maadin_backend` application.

## Locale resolution

- Default fallback locale: **`ar`**.
- **Prerequisite (new, discovered during design review):** the frontend currently sends no locale signal to the backend at all — no header, nothing. `lib/api.ts`'s Axios instance must be updated to attach the active locale (from `next-intl`'s routing) as a custom header, e.g. `X-Locale: en|fr|ar`, on every request. This is a small, contained frontend change and is part of this feature's scope, not a follow-up.
- Backend: a small piece of middleware reads `X-Locale` off every incoming request (falling back to `ar` if absent/invalid) and:
  1. Makes it available to the current request (e.g. `app()->setLocale($locale)` or a request attribute) for **self-notifications** (the recipient is the same person whose action triggered the email — e.g. `WelcomeEmail` on registration, `NewOrderPlaced` confirmation to the customer who just checked out). No database storage needed for this case.
  2. Passively writes it to the authenticated user's `locale` column (if logged in) — used for **other-party notifications** (the recipient did not make the triggering request — e.g. a seller notified of a new order placed by a customer, a message recipient, admin). Defaults to `ar` if a user has no stored value yet.
  - Requires a migration: `users` gains `locale` (string, default `'ar'`).
- Admin emails (`NewCustomerRegistered`, `NewSellerRegistered`, `NewSupportTicket`) are always sent in `ar` — fixed, no per-request or per-admin resolution needed, since there's a single fixed admin recipient.

## Recipient model

- **Admin:** a single fixed address from a new `ADMIN_NOTIFICATION_EMAIL` env var — not a query over `users where role=admin`. If this env var is unset, the app should fail loudly (a clear exception) rather than silently skipping admin emails, so misconfiguration is caught immediately rather than discovered as "admin never got notified."
- **Sellers/Customers:** the relevant `User` record for the event (e.g. the seller who owns the product being ordered, the customer who placed the order).

## Events (v1 — full list)

| # | Notification class | Recipient | Locale source | Triggered from |
|---|---|---|---|---|
| 1 | `WelcomeEmail` | New customer | Self (request) | Customer registration |
| 2 | `NewCustomerRegistered` | Admin | Fixed `ar` | Same registration event |
| 3 | `NewSellerRegistered` | Admin | Fixed `ar` | Seller store creation |
| 4 | `SellerVerificationUpdated` | Seller | Other-party (`users.locale`) | Admin approves/rejects the store |
| 5 | `NewOrderPlaced` | Customer | Self (request) | Order creation |
| 6 | `NewOrderReceived` | Seller(s) in the order (one per seller, since carts split by seller) | Other-party | Order creation |
| 7 | `OrderStatusChanged` | Customer | Other-party (status change is usually a seller/admin action) | Order status update (shipped/delivered/cancelled) |
| 8 | `NewMessageReceived` | Whichever of customer/seller did not send the message | Other-party | Alongside the existing in-app `Notification::create()` call in `MessageController` |
| 9 | `NewReviewReceived` | Seller | Other-party | Review creation on their product |
| 10 | `ReviewRequest` | Customer | Other-party (triggered by a status change, not the customer's own request) | Order marked delivered |
| 11 | `NewSupportTicket` | Admin | Fixed `ar` | Support ticket creation |

Each is a standalone Laravel Notification class in `app/Notifications/`, `via() = ['mail']` only (no `database` channel — that would collide with the existing custom `Notification` model/table, which is out of scope here).

## Components & structure

- `app/Notifications/` — the 11 classes above.
- `resources/views/emails/` — one Blade view per notification, sharing a common `emails/layout.blade.php` for consistent branding (name, colors; logo if available).
- `resources/lang/{en,fr,ar}/emails.php` — subject lines and body strings per locale, mirroring the frontend's existing EN/FR/AR structure.
- Triggering is direct: each controller action calls `$user->notify(new XyzNotification(...))` right after the relevant DB write. No new event/listener/observer indirection layer for v1 (YAGNI — every trigger point is a small, easily findable spot in an existing controller).

## Config/env changes

- `MAIL_MAILER=smtp`
- `MAIL_HOST=smtp-relay.brevo.com`, `MAIL_PORT=587`, `MAIL_USERNAME`/`MAIL_PASSWORD` (Brevo SMTP credentials)
- `MAIL_FROM_ADDRESS=noreply@maadinemarrakech.com`, `MAIL_FROM_NAME="Marrakech Maadine"`
- New: `ADMIN_NOTIFICATION_EMAIL=<admin's real inbox>`
- These are set independently in local `.env` (for testing) and in Coolify's environment variables for `maadin_backend` (for production) — never shared/copied as literal values between the two.

## Error handling

- Standard Laravel queue retry behavior (3 attempts, exponential backoff) covers transient SMTP/network failures.
- Permanently failed jobs land in the existing `failed_jobs` table — no new tooling needed; can be inspected via phpMyAdmin.
- Missing `ADMIN_NOTIFICATION_EMAIL` throws a clear config exception rather than silently no-op-ing.

## Testing plan (manual — no automated suite exists yet)

1. Local: verify with `MAIL_MAILER=log` first (rendered emails visible in `storage/logs/laravel.log`) to catch template/locale bugs cheaply.
2. Switch to real Brevo SMTP locally, trigger each of the 11 events, confirm delivery to a real test inbox with correct content and locale.
3. Confirm queue worker (`php artisan queue:work`) is actually required — verify emails do NOT send without it running, then confirm they do once it's running.
4. Repeat against production only after local verification passes: add Coolify env vars, add a persistent queue worker process for `maadin_backend`, deploy, re-trigger each event once against production data (or a safe test account) to confirm end-to-end.

## Rollout order

Local development and verification first, entirely before any production deploy — see Testing plan above. Production deployment is a separate, later step once every event has been manually verified locally.
