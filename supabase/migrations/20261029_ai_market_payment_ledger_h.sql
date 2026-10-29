-- STAGING ONLY: enforce payment replay/transaction identity in the database.
-- Depends on 20261029_ai_market_vendor_f.sql.
-- NEVER treat a client redirect, a form POST or an unverified webhook as payment proof.
create table if not exists public.ai_market_payment_events (
  id bigint generated always as identity primary key,
  provider text not null check(provider in ('paypal','alipay','wechat')),
  provider_event_id text not null check(length(provider_event_id) between 6 and 200),
  provider_transaction_id text not null check(length(provider_transaction_id) between 6 and 200),
  order_id uuid not null references public.ai_market_sponsored_orders(id) on delete restrict,
  currency text not null check(currency in ('USD','CNY')),
  amount_minor bigint not null check(amount_minor > 0),
  signature_verified_at timestamptz not null,
  settled_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(provider,provider_event_id),
  unique(provider,provider_transaction_id)
);
create index if not exists ai_market_payment_events_order on public.ai_market_payment_events(order_id,created_at desc);
create table if not exists public.ai_market_payment_refunds (
  id bigint generated always as identity primary key,
  payment_event_id bigint not null references public.ai_market_payment_events(id) on delete restrict,
  provider_refund_id text not null check(length(provider_refund_id) between 6 and 200),
  currency text not null check(currency in ('USD','CNY')),
  amount_minor bigint not null check(amount_minor > 0),
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(payment_event_id,provider_refund_id)
);
create index if not exists ai_market_refunds_payment_event on public.ai_market_payment_refunds(payment_event_id);
alter table public.ai_market_payment_events enable row level security;
alter table public.ai_market_payment_refunds enable row level security;
revoke all on public.ai_market_payment_events,public.ai_market_payment_refunds from anon,authenticated;
-- Future payment callback must verify provider signature + order status + currency + amount
-- and insert event + transition order + grant benefits in ONE atomic database transaction.
-- No publicly callable security-definer function is created by this migration.
