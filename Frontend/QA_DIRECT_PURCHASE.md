# Direct Purchase Regression Checklist

Use this checklist after changes related to ticket purchasing to validate the cart-to-direct-purchase transition.

## Access and navigation

- [ ] `/events` loads for guest and authenticated users.
- [ ] `/cart` redirects to `/events`.
- [ ] From an event details dialog, clicking `Buy` opens `/events/:eventId/purchase` for authenticated users.
- [ ] From an event details dialog, clicking `Buy` opens auth prompt for guests.

## Purchase flow

- [ ] Direct purchase page loads event data and ticket types without console errors.
- [ ] User can increment and decrement quantities within availability limits.
- [ ] Purchase button remains disabled when total selected quantity is `0`.
- [ ] User can purchase one ticket type successfully.
- [ ] User can purchase multiple ticket types in a single checkout successfully.

## Guardrails

- [ ] Sold out tickets cannot be increased.
- [ ] Sold out events show disabled purchase action and clear helper text.
- [ ] Non-active events show purchase-closed messaging and block checkout.
- [ ] API errors show actionable toast messages (401/403, validation, stock conflicts, server issues).

## Post-purchase and regressions

- [ ] Successful checkout redirects to `/my-purchases`.
- [ ] Purchased tickets appear in `/my-purchases`.
- [ ] Favorites flow still works (`/favorites`).
- [ ] Admin events page still works (`/admin/events`).
