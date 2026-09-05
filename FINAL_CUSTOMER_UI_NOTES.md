# Godavari Basket — Customer UI Final Review

## Product source
Products remain in Google Sheets. The Python FastAPI backend reads the configured public CSV URL and exposes `/api/products`.

Expected product columns:
`id, name, category, parent_category, subcategory, collection, gift_type, region, district, origin, tags, size, price, rating, reviews, badge, image, description, ingredients, benefits, stock, active`

Seller marketplace fields are intentionally removed.

## Login
- Google login
- Email + password login
- Mobile number + password login
- New account form collects name, email, mobile and password
- No OTP UI or OTP API calls
- WhatsApp support for login problems

Mobile-password registration uses the server-side Supabase admin API to create the account with the supplied email/mobile confirmed, because this project intentionally does not use phone OTP.

## Customised baskets
No prices are shown in the customised-basket experience. Products, quantities, occasion, gift message and special requirements are sent to Godavari Basket through a pre-filled WhatsApp quote request.

## Influencer links
No referral/influencer UI appears to customers. `?ref=CODE` is captured silently, removed from the visible URL, and attached to a paid order only when that code belongs to an active influencer in Supabase.

## Supabase
`supabase/schema.sql` is the clean target schema.
`supabase/FEATURES_V2_MIGRATION.sql` is the corrective migration for the existing database. Review before applying.
