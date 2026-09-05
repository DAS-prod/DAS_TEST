-- ============================================================
-- GODAVARI BASKET — CLEAN TARGET SCHEMA
-- Product catalogue remains in Google Sheets (NOT Supabase).
-- This schema stores customers, orders, payments, coupons and
-- hidden influencer attribution only.
-- ============================================================

create extension if not exists pgcrypto;

-- CUSTOMER PROFILE ------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CUSTOMER ADDRESSES ---------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  full_name text not null,
  mobile text not null,
  address_line1 text not null,
  address_line2 text,
  landmark text,
  pincode text not null,
  city text not null,
  state text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- COUPONS ---------------------------------------------------------
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
on conflict (code) do nothing;

-- INFLUENCERS (NO CUSTOMER-FACING UI) ----------------------------
create table if not exists public.influencers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  referral_code text not null unique,
  commission_percent numeric(5,2) not null default 5 check (commission_percent >= 0 and commission_percent <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ORDERS ----------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('GB-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  currency text not null default 'INR',
  coupon_code text,
  referral_code text,
  referral_commission_rate numeric(5,2) not null default 0 check (referral_commission_rate >= 0 and referral_commission_rate <= 100),
  referral_commission_amount numeric(12,2) not null default 0 check (referral_commission_amount >= 0),
  delivery_name text not null,
  delivery_mobile text not null,
  delivery_email text not null,
  delivery_address_line1 text not null,
  delivery_address_line2 text,
  delivery_landmark text,
  delivery_pincode text not null,
  delivery_city text not null,
  delivery_state text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ORDER ITEMS: snapshot of Google Sheet product data at purchase --
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_image text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

-- PAYMENTS --------------------------------------------------------
create table if not exists public.order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  provider text not null default 'cashfree',
  provider_order_id text not null unique,
  provider_payment_id text unique,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- INDEXES ---------------------------------------------------------
create index if not exists addresses_user_id_idx on public.addresses(user_id);
create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_referral_code_idx on public.orders(referral_code) where referral_code is not null;
create index if not exists orders_coupon_code_idx on public.orders(coupon_code) where coupon_code is not null;
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists influencers_referral_code_idx on public.influencers(referral_code);

-- ROW LEVEL SECURITY ---------------------------------------------
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_payments enable row level security;
alter table public.coupons enable row level security;
alter table public.influencers enable row level security;

-- Customers can only read/update their own customer data.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own" on public.addresses for select using (auth.uid() = user_id);
drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own" on public.addresses for insert with check (auth.uid() = user_id);
drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own" on public.addresses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own" on public.addresses for delete using (auth.uid() = user_id);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

drop policy if exists "order_payments_select_own" on public.order_payments;
create policy "order_payments_select_own" on public.order_payments for select using (
  exists (select 1 from public.orders o where o.id = order_payments.order_id and o.user_id = auth.uid())
);

-- coupons/influencers have no public policies. Server routes use the service-role key.

-- PROFILE CREATION ------------------------------------------------
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
