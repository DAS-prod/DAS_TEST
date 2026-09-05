# Godavari Basket – Final Customer UI Fixes

## Product grid
- Restored visible product size/weight from the existing Google Sheet `size` column.
- Size is shown on the product card and product details view.
- No new product database was introduced; Google Sheets remains the product source.

## Wishlist
- Consolidated wishlist logic into `frontend/lib/wishlist.ts`.
- Product hearts, header wishlist count, and wishlist filtering now use the same saved state.
- Duplicate/invalid wishlist IDs are cleaned automatically.

## Premium typography
- Cormorant Garamond: hero/category/major headings.
- Manrope: navigation, buttons, forms, product cards, prices and checkout.
- Fonts are loaded through Google Fonts CSS; no font files are bundled.

## Referral/influencer tracking
- No referral UI is shown to customers.
- `?ref=CODE` is captured silently by `ReferralTracker` and removed from the visible URL.
- Checkout passes the stored code to the verified order flow.
- The backend validates it against the separate `influencers` table before storing attribution/commission.

## Customised baskets
- No product prices, subtotal or total are shown in the custom-basket flow.
- Customer selects items/quantities and customisation details.
- Final action is a WhatsApp quote request.

## Login
- No OTP flow.
- Email or mobile number + password, with Google sign-in and WhatsApp support.
