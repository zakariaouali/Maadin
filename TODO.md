# TODO

Open items, newest first. Each one says what is wrong today and what has to be decided.

## 1. Admin cannot process orders (and cannot talk to customers) for managed stores

**Reported 2026-10-23.** Checkout works. The order for the managed store
("Martisana") appears in Admin > Managed accounts, but the admin can
only look at it. Nobody can process it.

### What is missing today (verified in the code)

- **No actions on an order.** The admin routes are read-only:
  `GET /admin/orders`, `GET /admin/orders/{id}`, and the order list inside
  `GET /admin/managed-sellers/{userId}`. The only endpoint that confirms, ships,
  delivers or cancels an order is `PUT /seller/orders/{id}/status`, and it sits
  behind the `seller` middleware (`role === 'seller'`). An admin gets 403.
- **No way to act as the store.** The managed store's user has a random
  password by design, so the admin cannot log in as it either.
- **No conversation with the customer.** `/admin/conversations` is read-only
  (list, view, delete). The admin is not a participant of the customer's
  conversation, and `POST /messages/send` only works inside a conversation the
  sender belongs to. Also, a new-message email goes to the store user's address.
- **Alerts go nowhere.** For an order on a managed store, the "new order" email
  and notification are sent to the store user's email. If that is a placeholder
  address nobody reads, nobody is told. (Check what email the production store
  user has.)
- **No order detail inside the managed account page.** The Orders tab shows only
  number, customer name, status and total. No items, address, phone, notes.

### What the admin needs to be able to do (to design)

1. Open the order: items, quantities, delivery address, phone, customer notes.
2. Move it through the states: pending -> confirmed -> shipped -> delivered,
   or cancelled (stock goes back, as the seller flow already does), with the
   tracking number field.
3. Put it **on hold** ("en attente"): a state or flag with a reason, for example
   when the customer must be called first. (There is no hold state today.)
4. Message or call the customer: write in the order's conversation as the store,
   and show the customer's phone with a call / WhatsApp button.
5. See an internal log of what was done (who changed what, when).
6. Receive the "new order" alert as admin (email and in-app badge), not only the
   store user.

### Questions to settle first

- Should the admin act **as the store** (same screens as a seller, shown inside
  the managed account) or have **separate admin order screens**?
  Reusing the seller order screens inside the managed account page is the
  cheapest and keeps one set of rules.
- Who is the sender of messages to the customer: the store name, or the admin?
- Does "on hold" block stock, or release it?
- Cash on delivery: who records that the cash was collected and later paid out
  to the seller (ties into the twice-a-month payout process)?

### Likely shape of the fix

- **Backend:** admin routes `PUT /admin/orders/{id}/status` (same transitions
  and stock/email side effects as the seller controller, extracted into one
  shared service so the rules cannot diverge), an on-hold state plus reason,
  an audit log entry per action (the `admin_audit_logs` table already exists),
  and admin-initiated messages in a customer conversation.
- **Frontend:** an order detail view and action buttons in Admin > Managed
  accounts > Orders, plus a message box and call/WhatsApp buttons.
- **Notifications:** route managed-store order alerts to the admin inbox too.
- **Tests:** transition rules, stock restore on cancel, 403 for non-admins.
