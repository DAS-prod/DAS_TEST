# Godavari Basket V2 — Local testing guide

## What is implemented
- One login screen for every customer: Google, Email/Password, or Phone OTP.
- WhatsApp help button for login and checkout issues.
- 5% coupon flow with minimum order of ₹1,000.
- Referral links and a separate referral dashboard with 5% referral-share tracking.
- Estimated delivery copy: 2–5 working days.
- Five auto-sliding homepage hero banners and five dedicated collection pages:
  - `/combos`
  - `/art-and-craft`
  - `/gifting`
  - `/90s-specials`
  - `/seasonal`
- Premium `/custom-basket` builder with product selection, review and personalization.
- Improved Godavari map navigation chips.

## Run locally
Backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`.

## Local coupon before Supabase migration
The frontend env contains local fallback values:
- `DEFAULT_COUPON_CODE=GODAVARI5`
- `DEFAULT_COUPON_PERCENT=5`
- `DEFAULT_COUPON_MINIMUM=1000`
- `DEFAULT_COUPON_ACTIVE=true`

This allows coupon UI/payment-total testing before the `coupons` table is added. After the migration exists, the server reads the coupon from Supabase first, so you can activate/deactivate coupons there.

## Supabase changes — do after UI review
Do **not** apply yet if you only want to review the local UI. When ready, run:
`supabase/FEATURES_V2_MIGRATION.sql`

This adds coupon, referral and custom-order fields without removing existing order data.

## Phone OTP
The UI is implemented for all users. Supabase phone auth still requires a configured SMS/phone provider. The sender name/branding depends on that provider and its approved sender configuration. Google and Email/Password continue to work independently.

## Referral behavior
A URL like `/?ref=GBRXXXXXXXX` is stored silently. The referred shopper sees the normal Godavari Basket website. On a paid order, the referral code is attached to the order after the V2 migration is applied. Self-referrals are ignored.

The referral dashboard table intentionally shows only:
- Customer Name
- Total Items
- Total Amount

The dashboard also shows aggregate 5% referral share.

## Security
The uploaded project contained real service-role credentials in env files. Keep `.env.local` and `backend/.env` local only, never commit them. Rotate the Supabase service-role key before production deployment if it has ever been exposed outside your private environment.
