# Final Product Grid Restore

- `ProductCard.tsx` restored from the exact approved DAS_TEST-style code supplied by the user.
- `ProductGrid.tsx` restored from the exact approved DAS_TEST-style code supplied by the user.
- Google Sheet columns `250g`, `500g`, and `1kg` are now exposed directly by the backend API as well as through the existing `variants` array.
- The frontend `Product` type now includes optional `250g`, `500g`, and `1kg` price fields so the approved card can display/select them correctly.
- Newer production features remain in place: hero assets, checkout/coupon logic, hidden referral attribution, login changes, custom-basket WhatsApp quote flow, wishlist event syncing, and payment timeout handling.
