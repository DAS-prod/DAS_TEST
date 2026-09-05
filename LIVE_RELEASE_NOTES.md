# Godavari Basket — Live Release Candidate

Included in this customer-site package:

- Products remain sourced from Google Sheets.
- Product cards retain the existing Godavari Basket catalogue design.
- Multiple weight/price variants are supported from Google Sheet columns such as 250g, 500g and 1kg.
- Wishlist uses the shared local-storage utility and synchronizes card/header/filter state.
- Login supports email or mobile number + password and Google login; there is no OTP flow.
- WhatsApp remains a support option for login/customer help.
- Coupons are validated server-side from Supabase.
- Influencer referral tracking is hidden from customers and is captured from `?ref=CODE`.
- Five homepage hero/category experiences remain: Combos, Art & Craft, Gifting, 90s Specials and Seasonal.
- Customised Basket shows no prices and requests the final quote through WhatsApp.
- Checkout shows 2–5 working days delivery guidance.
- Gateway/payment verification timeouts preserve cart/address data and show a dismissible Check Payment Status action.
- Responsive product images, cards, hero content and custom-basket layouts are retained for mobile/desktop.

Before production deploy, confirm frontend and backend environment variables are set in the production hosting dashboards and rotate any service-role secret that has previously been shared or committed.
