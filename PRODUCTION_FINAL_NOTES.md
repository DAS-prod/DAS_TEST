# Godavari Basket — Production Final

Production customer website build prepared for live deployment.

## Final homepage fixes
- Restored the DAS_TEST compact ProductGrid/ProductCard proportions and layout.
- Google Sheet weight-price columns (250g, 500g, 1kg and similar units) are exposed as selectable variants.
- Selected weight and price follow into cart/checkout as a distinct cart line.
- Wishlist uses the shared synchronized wishlist helper.
- Approved hero artwork is bundled locally under `frontend/public/images/hero-approved`.
- Desktop hero uses the approved wide artwork; mobile uses dedicated mobile compositions for readability.

## Existing live features retained
- Google + email/mobile-number password login (no OTP UI).
- WhatsApp support.
- Supabase coupon validation.
- Hidden `?ref=CODE` influencer attribution.
- Custom basket quote flow with no prices; final quote goes to WhatsApp.
- 2–5 working days delivery note.
- Safer payment verification timeout handling; cart/address remain intact until successful verification.
- Product catalogue remains sourced from Google Sheets through the FastAPI backend.

## Google Sheet compatibility
Supported price/weight columns include `250g`, `500g`, `1kg`, `250g_price`, `price_250g`, and equivalent g/kg/ml/l patterns. `gift_type` and existing `gift_types` headers are both accepted.
