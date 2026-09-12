# Email Notification System — Design

Date: 2026-09-12 (revised same day after discovering existing infrastructure)
Status: Approved for planning

## Problem

The admin has no way to know about important platform events (e.g. a new customer registering) unless they manually check the database/dashboard. The platform already has a rich **in-app notification** system (bell icon), but in-app notifications require being logged into the site — they don't reach anyone's inbox.

## What already exists (discovered during design — do not rebuild)

A prior deploy (commit `44d7621`, already merged into `origin/main`) built substantially more than initially known:

- **Locale system, already fully working:** frontend sends `X-Locale: en|fr|ar` on every request; `App\Http\Middleware\SyncUserLocale` passively updates `users.locale` on each authenticated request; `users` already has a `locale` column. This is exactly what this spec originally planned to build — it's done, just reuse it.
- **In-app notification pipeline**, already firing for nearly every relevant event via `App\Models\Notification::create()`/`Notification::send()`, with copy sourced from `App\Support\NotificationMessages::get($event, $locale, $vars)` (a static array of EN/FR/AR `[title, body]` pairs per event key, e.g. `order.placed`, `order.shipped`, `review.received`, `message.received`, subscription lifecycle events, product approval, support ticket updates). Trigger sites already exist in: `Customer\CheckoutController` (order placed), `Seller\OrderController` (order status changes), `Customer\ReviewController` (review received), `MessageController` (new message), `Seller\SubscriptionController` / `Admin\ManagedSellerController` / `SuspendExpiredSubscriptions` command (subscription/plan events), `SupportTicketController` (both customer and admin versions).
- **Support tickets are a fully built feature** (not missing, as first assumed) — `App\Models\SupportTicket`, `SupportTicketController` (customer/guest submission with category, list, view, unread count) and `Admin\SupportTicketController` (list/filter, reply, status/priority, stats). The only gap: the admin does not get emailed when a new ticket comes in (only the ticket-submitter gets an in-app notification).
- **Real email delivery is already proven working**, via **Resend** (not Brevo — superseding this spec's original provider choice): `backend/.env.example` has `smtp.resend.com` SMTP config, and `AuthController`'s forgot-password flow does `Mail::to($user->email)->send(new PasswordResetMail(...))`.
- **A professional, on-brand HTML email template already exists**: `resources/views/emails/password-reset.blade.php` — gold gradient top bar, logo from Cloudinary, card-on-sand layout, per-locale inline `@if/@elseif/@else` text blocks (not a separate `resources/lang` file — this is the established pattern here, and this spec now follows it instead of introducing a new one), RTL-aware `text-align`/`dir` handling. This is the visual bar every new template matches.

## Revised goals

Given the above, the actual scope is much smaller than first planned:

1. **Provider:** use **Resend**, already configured and proven. No new provider setup.
2. Add real **email delivery alongside every existing in-app notification trigger point** — reuse `NotificationMessages` copy where sensible, so email and in-app bell say the same thing.
3. Add the handful of events that have **no notification at all yet** (email or in-app): welcome email, admin alerts for new customer/new seller/new support ticket, and a review-request email after delivery.
4. Extract the password-reset template's structure into a shared partial so ~9 new templates don't duplicate ~160 lines of boilerplate each.

## Non-goals (unchanged)

- No user-facing notification preferences/opt-out UI.
- No automated test suite for this feature (matches the rest of the codebase).
- No digest/summary emails.
- No changes to the in-app notification bell system's own behavior — it keeps working as-is; email is additive.

## Admin recipient

Single fixed address via a new `ADMIN_NOTIFICATION_EMAIL` env var (unchanged from original decision) — not a query over `users where role=admin`. Missing env var should throw a clear config exception rather than silently no-op. Admin emails are always in `ar` (fixed), matching the earlier decision.

## Events — final list and exact hook points

| # | Notification | Recipient | Reuses existing `NotificationMessages` key? | Exact hook (file:approx area) |
|---|---|---|---|---|
| 1 | Welcome email | New customer/seller | No — new copy needed | `AuthController::register` |
| 2 | New customer registered | Admin | No — new copy | `AuthController::register` (when `role === 'customer'`) |
| 3 | New seller registered | Admin | No — new copy | `Seller\StoreController::store` (this is when a `Seller` record — the actual store — is created, which is the meaningful "seller registered" moment, not raw account creation) |
| 4 | Seller verification updated | Seller | No — new copy (mirrors existing admin audit actions) | `Admin\SellerController::verify` / `suspend` / `reactivate` |
| 5 | Order placed (customer confirmation) | Customer | No — no customer-facing copy exists yet, only the seller-facing `order.placed` key | `Customer\CheckoutController::store`, right after each `Order::create(...)` per seller |
| 6 | Order received (seller) | Seller | Yes — reuse `order.placed` | Same site as #5 — `Customer\CheckoutController::store` |
| 7 | Order status changed | Customer | Yes — reuse `order.confirmed`/`order.shipped`/`order.delivered`/`order.cancelled` (event key already computed) | `Seller\OrderController::updateStatus`, alongside the existing `NotificationMessages::get($event, ...)` call |
| 8 | New message received | Whichever party didn't send it | Yes — reuse `message.received` | `MessageController::store`, alongside the existing call |
| 9 | New review received | Seller | Yes — reuse `review.received` | `Customer\ReviewController::store`, alongside the existing call |
| 10 | Review request (post-delivery) | Customer | No — new copy | `Seller\OrderController::updateStatus`, when `status === 'delivered'` (same block that already sets `delivered_at`) |
| 11 | New support ticket | Admin | No — new copy (existing `support` in-app copy is user-facing, not admin-facing) | `SupportTicketController::store` (unauthenticated/customer/seller submission path — the one admin needs to see, unconditionally, not just when `$user` is set) |

11 events total, matching the original count, but 5 of them (#6, #7, #8, #9, and reusing copy for #6/7/8/9) hook into **existing code that's already computing the right locale/title/body** — so those are genuinely small additions (a few lines each), not new classes built from scratch conceptually.

## Locale resolution (simplified — infra already exists)

- Reuse `$request->user()->locale` (or `$user->locale`) wherever a `User` model is available — already populated by `SyncUserLocale`.
- Admin emails: always `ar` (fixed, per earlier decision — no per-admin lookup needed since there's one fixed recipient).
- Guest support ticket submissions (`SupportTicketController::store` when `!$user`) have no `User` record and thus no stored locale — for the admin alert this doesn't matter (admin is always `ar`); there's no customer-facing email for a guest ticket in this scope (guests aren't emailed a confirmation — matches existing behavior, where guests get no in-app notification either since there's no user_id to notify).

## Components & structure

- `app/Mail/` — one Mailable class per event needing new copy or a distinct template: `WelcomeEmail`, `NewCustomerRegisteredMail` (admin), `NewSellerRegisteredMail` (admin), `SellerVerificationUpdatedMail`, `OrderPlacedMail` (customer), `OrderReceivedMail` (seller), `OrderStatusChangedMail`, `NewMessageMail`, `NewReviewMail`, `ReviewRequestMail`, `NewSupportTicketMail` (admin). All plain Laravel `Mailable`s (matching the existing `PasswordResetMail` pattern) — **not** Laravel Notification classes, since the codebase's established pattern for real email is `Mail::to(...)->send(new XyzMail(...))`, and introducing a second pattern (`Notification`) alongside the existing custom in-app `Notification` model would be confusing. Each implements `ShouldQueue` (via the `Queueable` trait already used, plus explicitly implementing the `ShouldQueue` interface, which `PasswordResetMail` currently does **not** do — this is a real gap to fix so email sending doesn't block requests).
- `resources/views/emails/partials/layout.blade.php` — new shared partial extracted from `password-reset.blade.php`'s structure (logo, gold top bar, white card, footer), taking `$locale` and a `$content` slot (via Blade's `@include`/component slot mechanism) so each new template only writes its own headline/body/CTA, not the full boilerplate.
- `resources/views/emails/*.blade.php` — one per Mailable, using the shared partial, following the same inline `@if($locale === 'fr') ... @elseif ... @else ... @endif` translation pattern as `password-reset.blade.php` (no new `resources/lang/emails.php` file — matches existing precedent).
- Triggering: each hook point above gets 1-3 new lines calling `Mail::to(...)->send(new XyzMail(...))`, placed immediately next to (not replacing) the existing in-app `Notification::create()`/`NotificationMessages::get()` calls where those already exist.

## Config/env changes

- Confirm production's real `.env` (not `.env.example`) has a real `RESEND_...`/`MAIL_PASSWORD` API key configured, not the placeholder `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` — verify this as an early implementation step, since it's unknown whether password-reset emails are actually reaching inboxes in production today or just structurally ready to.
- New: `ADMIN_NOTIFICATION_EMAIL` env var (both local `.env` and Coolify's `maadin_backend` environment variables).

## Error handling

- Standard Laravel queue retry (3 attempts, exponential backoff) via `ShouldQueue` on every new Mailable — fixes the gap where even `PasswordResetMail` currently sends synchronously.
- Failures land in the existing `failed_jobs` table.
- Missing `ADMIN_NOTIFICATION_EMAIL` throws a clear config exception rather than silently no-op-ing.

## Testing plan (manual — no automated suite exists yet)

1. Local: verify production's Resend key situation first (see Config section) before assuming email "already works."
2. Trigger each of the 11 events locally, confirm delivery to a real test inbox with correct branded template and correct locale (test at least one event in each of EN/FR/AR).
3. Confirm queue worker (`php artisan queue:work`) is required for these to actually send — verify they don't send without it, then confirm they do with it running. (Check first whether a queue worker is already running in production for the existing subscription-related queued jobs, if any — `SuspendExpiredSubscriptions` is a scheduled command, not necessarily proof a worker exists.)
4. Deploy to production only after full local verification — add `ADMIN_NOTIFICATION_EMAIL` to Coolify, confirm/add a persistent queue worker process, deploy, re-trigger each event once against a safe test account.

## Rollout order

Local development and verification first, entirely before any production deploy — see Testing plan above.
