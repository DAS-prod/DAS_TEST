-- ============================================================
-- GODAVARI BASKET — CLEANUP / FEATURE MIGRATION
-- Use this when we are ready to align the EXISTING Supabase DB.
-- It removes the old customer-referral/custom-basket DB leftovers
-- and creates hidden influencer attribution instead.
-- ============================================================

create extension if not exists pgcrypto;

-- Remove referral identity from normal customer profiles.
drop index if exists public.profiles_referral_code_uidx;
alter table public.profiles drop column if exists referral_code;

-- Customised baskets are quoted on WhatsApp and are NOT checkout orders.
alter table public.orders drop column if exists is_custom_order;
alter table public.orders drop column if exists custom_gift_message;
alter table public.orders drop column if exists custom_occasion;
alter table public.orders drop column if exists custom_instructions;

-- Remove legacy product snapshot fields no longer supplied by Google Sheets.
alter table public.order_items drop column if exists product_handle;
alter table public.order_items drop column if exists sku;

-- Coupon fields.
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent numeric(5,2) not null default 5 check (discount_percent >= 0 and discount_percent <= 100),
  minimum_order numeric(12,2) not null default 1000 check (minimum_order >= 0),
  maximum_discount numeric(12,2),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.coupons (code, discount_percent, minimum_order, active)
values ('GODAVARI5', 5, 1000, true)
on conflict (code) do update
set discount_percent = excluded.discount_percent,
    minimum_order = excluded.minimum_order;

alter table public.orders add column if not exists discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0);
alter table public.orders add column if not exists coupon_code text;

-- Hidden influencer attribution. Normal customers never receive a referral code.
create table if not exists public.influencers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  referral_code text not null unique,
  commission_percent numeric(5,2) not null default 5 check (commission_percent >= 0 and commission_percent <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists referral_code text;
alter table public.orders add column if not exists referral_commission_rate numeric(5,2) not null default 0 check (referral_commission_rate >= 0 and referral_commission_rate <= 100);
alter table public.orders add column if not exists referral_commission_amount numeric(12,2) not null default 0 check (referral_commission_amount >= 0);

create index if not exists orders_referral_code_idx on public.orders(referral_code) where referral_code is not null;
create index if not exists orders_coupon_code_idx on public.orders(coupon_code) where coupon_code is not null;
create index if not exists influencers_referral_code_idx on public.influencers(referral_code);

alter table public.coupons enable row level security;
alter table public.influencers enable row level security;
-- No public policies: both are accessed through trusted server routes.

-- Cashfree is the active payment provider.
alter table public.order_payments alter column provider set default 'cashfree';

-- Keep customer profile small: name + phone only.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone)
  on conflict (id) do update
    set full_name = coalesce(public.profiles.full_name, excluded.full_name),
        phone = coalesce(public.profiles.phone, excluded.phone),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
