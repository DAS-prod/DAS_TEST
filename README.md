# Godavari Basket — Supabase + Cashfree Edition

This build keeps the **main Godavari Basket UI** as the source of truth and adds the Supabase/Cashfree checkout architecture used by V1.

## Included
- Existing desktop and responsive Godavari Basket UI/assets preserved.
- New Explore the Godavari categories:
  1. Sweets
  2. Snacks
  3. Pickles (Veg Pickles / Non-Veg Pickles)
  4. Podis
  5. Vadiyalu & Papad
  6. Dry Fruits & Nuts
  7. Ghee & Oils
  8. Traditional Specials
  9. Millet Products
  10. Art & Traditionals
- Separate Combos & Gift Hampers banner.
- Mobile footer and mobile bottom navigation removed as requested.
- Same Supabase table structure as V1; `supabase-schema-reference.sql` is included for reference only and should not be re-run on an existing database.
- Razorpay removed from the frontend checkout flow.
- Cashfree hosted checkout using the current v2025-01-01 API.
- Server-side Cashfree payment verification before writing paid orders to Supabase.
- Existing `orders`, `order_items`, `addresses`, `order_payments`, and `profiles` tables are reused.
- Existing product API remains the catalog source, so the UI/product data does not need to be rebuilt.

## Environment
Copy `.env.example` to `.env.local` and fill the values. Never commit `SUPABASE_SERVICE_ROLE_KEY` or Cashfree secret keys.

## Run
```bash
npm install
npm run dev
```

## Production
Set `CASHFREE_ENV=production` and production Cashfree credentials only after sandbox testing is complete. Set `NEXT_PUBLIC_SITE_URL` to the deployed site URL.


## Godavari discovery metadata
The existing Google Sheet remains the catalog source. The backend now accepts optional columns:
`region`, `district`, `origin`, `tags`, and `gift_type`. Existing rows continue to work without these columns, but region/map filtering requires `region` or `district` (recommended) to be populated.

## Social / contact configuration
Set `NEXT_PUBLIC_WHATSAPP_NUMBER=919618851406`. Keep `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_YOUTUBE_URL`, and `NEXT_PUBLIC_BLOG_URL` blank until the official URLs are known; the UI does not invent social profiles.
