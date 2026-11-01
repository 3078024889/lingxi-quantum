-- Isolated AI-market merchant ledger. Does not alter public.orders or existing submissions.
create schema if not exists ai_market_private;
revoke all on schema ai_market_private from public, anon, authenticated;
grant usage on schema ai_market_private to service_role;

create table if not exists ai_market_private.billing_orders (
 id uuid primary key default gen_random_uuid(),
 vendor_claim_id uuid,
 product_id text not null check (length(product_id) between 1 and 120),
 plan_id text not null check (plan_id in ('sponsored','category','brand')),
 currency text not null check (currency in ('CNY','USD')),
 amount_minor bigint not null check (amount_minor > 0 and amount_minor <= 100000000),
 provider text check (provider in ('alipay','wechat','paypal')),
 status text not null default 'created' check (status in ('created','pending','paid','failed','expired','partially_refunded','refunded')),
 merchant_order_ref text not null unique,
 provider_order_ref text,
 provider_payment_ref text,
 paid_verified_at timestamptz,
 delivered_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint provider_currency_consistent check(provider is null or (provider='paypal' and currency='USD') or (provider in ('alipay','wechat') and currency='CNY')),
 constraint paid_requires_proof check(status not in ('paid','partially_refunded','refunded') or paid_verified_at is not null),
 constraint delivered_requires_proof check(delivered_at is null or paid_verified_at is not null)
);
create unique index if not exists ai_market_order_provider_reference on ai_market_private.billing_orders(provider,provider_order_ref) where provider_order_ref is not null;
create unique index if not exists ai_market_payment_reference on ai_market_private.billing_orders(provider,provider_payment_ref) where provider_payment_ref is not null;
create index if not exists ai_market_order_status_created on ai_market_private.billing_orders(status,created_at desc);

create table if not exists ai_market_private.payment_events (
 id uuid primary key default gen_random_uuid(),
 provider text not null check(provider in ('alipay','wechat','paypal')),
 external_event_id text not null check(length(external_event_id) between 4 and 200),
 order_id uuid references ai_market_private.billing_orders(id) on delete restrict,
 payload_sha256 text not null check(payload_sha256 ~ '^[a-f0-9]{64}$'),
 signature_verified_at timestamptz not null,
 processed_at timestamptz,
 processing_result text,
 created_at timestamptz not null default now(),
 unique(provider,external_event_id)
);

create table if not exists ai_market_private.payment_refunds (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references ai_market_private.billing_orders(id) on delete restrict,
 provider text not null check(provider in ('alipay','wechat','paypal')),
 provider_refund_ref text not null,
 refund_amount_minor bigint not null check(refund_amount_minor>0),
 status text not null default 'requested' check(status in ('requested','processing','refunded','failed')),
 refunded_verified_at timestamptz,
 created_at timestamptz not null default now(),
 unique(provider,provider_refund_ref),
 constraint refunded_proof_required check(status<>'refunded' or refunded_verified_at is not null)
);

alter table ai_market_private.billing_orders enable row level security;
alter table ai_market_private.payment_events enable row level security;
alter table ai_market_private.payment_refunds enable row level security;
revoke all on all tables in schema ai_market_private from public, anon, authenticated;
grant select,insert,update,delete on all tables in schema ai_market_private to service_role;
