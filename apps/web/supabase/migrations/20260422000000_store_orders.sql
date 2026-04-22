-- Custom store orders table for Breeze Man Books signed-copy purchases.
--
-- This is intentionally SEPARATE from Makerkit's `public.orders` table (billing
-- subscriptions/one-time orders schema). The previous attempt at
-- `20260320000000_orders.sql` tried to `CREATE TABLE IF NOT EXISTS public.orders`
-- which silently no-ops because Makerkit already creates that table with a
-- different column set, so Stripe webhook inserts targeting `book_title`,
-- `buyer_name`, etc. silently failed.
--
-- We use a distinct table name (`store_orders`) so both schemas coexist.

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  book_title text not null,
  quantity integer not null default 1,
  amount_total integer not null, -- amount in cents (matches Stripe `amount_total`)
  currency text not null default 'usd',
  buyer_name text,
  buyer_email text,
  buyer_address jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.store_orders is
  'Signed-copy / merch orders from the public Stripe checkout (not Makerkit billing).';

create index if not exists store_orders_stripe_session_id_idx
  on public.store_orders (stripe_session_id);

create index if not exists store_orders_created_at_idx
  on public.store_orders (created_at desc);

-- RLS: service role only. Webhook inserts with the service key; there is no
-- authenticated-user path to these rows.
alter table public.store_orders enable row level security;

revoke all on public.store_orders from authenticated, service_role;

grant select, insert, update, delete on table public.store_orders to service_role;

create policy "store_orders_service_role_all"
  on public.store_orders
  for all
  to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
