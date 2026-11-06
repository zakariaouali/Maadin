# TODO

Open items, newest first. Each one says what is wrong today and what has to be decided.

## 1. Admin order handling for managed stores: DONE (2026-11-06), follow-ups below

Reported 2026-10-23: the admin could see an order for a managed store but not process it.

### What exists now

- **Admin screens** (Admin > Orders, and Admin > Managed accounts > Orders tab > "Process"):
  one shared panel with the order details, the customer's phone with Call and WhatsApp
  buttons, delivery address, customer notes and items.
- **Status steps**: confirm, ship (with tracking number), deliver (cash received), cancel
  (stock goes back, customer is told). Same rules as the seller screens: both call
  `App\Services\OrderStatusService`, so they cannot drift apart.
- **On hold ("en attente")**: a flag with a reason (`orders.on_hold`, `orders.hold_reason`).
  A held order cannot be confirmed, shipped or delivered until released; cancelling is
  still allowed and clears the hold. Stock stays reserved while on hold. Admin Orders has an
  "On hold" filter.
- **Message the customer**: written as the store, inside the normal conversation (tied to
  the order); the customer gets the in-app notification and the email.
- **History**: every admin action is written to `admin_audit_logs` and shown on the order.
- **Alerts**: a new order on a managed/premium store now notifies every admin in the app and
  sends the email to `ADMIN_NOTIFICATION_EMAIL` (a failure there never blocks the checkout).
- **Customer replies reach the team**: when a customer writes to a managed store, every admin
  gets an in-app alert (and an email to `ADMIN_NOTIFICATION_EMAIL`) linking to
  `/admin/conversations/{id}`, which opens that thread. The thread has a reply box that sends
  as the store (`POST /admin/conversations/{id}/reply`); the customer's messages are then
  marked read. Shared sender: `App\Services\StoreMessenger`. Tests: `CustomerRepliesTest`.
- **Scope**: only stores on the `managed` or `premium` plan. For a store that runs its own
  orders the admin gets 403 on these actions (view only).
- Tests: `backend/tests/Feature/AdminOrderHandlingTest.php`.

### Still open

- **Cash on delivery payouts**: nothing records that the cash was collected and later paid
  out to the seller (the 1st and 15th payouts in the terms). Ties into commission tracking.
- **Store-side alerts** still go to the store user's own email, which may be a placeholder.
  Check what email the production managed store user has.
- **Audit log viewer**: the entries are written but there is no screen listing all of them
  (only the per-order history).
- **Deployment**: the migration `2026_11_06_100000_add_hold_to_orders_table` is NOT run
  automatically in production (`AUTORUN_ENABLED=false`): run `php artisan migrate --force`
  in Coolify > maadin_backend > Terminal after the deploy.
