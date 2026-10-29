-- Isolated staging migration. Never run automatically on production.
create table if not exists public.ai_market_vendor_claims (
 id uuid primary key default gen_random_uuid(),
 company_id text not null references public.ai_market_identity(id),
 product_id text not null references public.ai_market_identity(id),
 actor_id uuid not null references auth.users(id),
 proof_type text not null check(proof_type in ('domain_dns','domain_file','official_email')),
 proof_metadata jsonb not null default '{}'::jsonb,
 status text not null default 'pending' check(status in ('pending','approved','rejected','revoked')),
 reviewed_by uuid references auth.users(id),
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 check((status='approved')=(reviewed_by is not null and verified_at is not null))
);
create unique index if not exists ai_market_claims_single_approved on public.ai_market_vendor_claims(product_id) where status='approved';
create index if not exists ai_market_claims_company_status on public.ai_market_vendor_claims(company_id,status);
create table if not exists public.ai_market_sponsored_orders (
 id uuid primary key default gen_random_uuid(),
 company_id text not null references public.ai_market_identity(id),
 product_id text not null references public.ai_market_identity(id),
 actor_id uuid not null references auth.users(id),
 slot text not null check(slot in ('category_feature','search_sponsored','comparison_sponsored','homepage_feature')),
 currency text not null check(currency in ('USD','CNY')),
 nominal_amount numeric(18,2) not null check(nominal_amount>=0),
 idempotency_key text not null,
 provider text check(provider in ('alipay','wechat','paypal')),
 provider_order_ref text,
 status text not null default 'pending_payment' check(status in ('pending_payment','paid','active','expired','cancelled','refunded')),
 paid_at timestamptz,
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz not null default now(),
 unique(actor_id,idempotency_key),
 check((status not in ('paid','active','expired')) or paid_at is not null),
 check(ends_at is null or starts_at is not null and ends_at>starts_at)
);
create index if not exists ai_market_sponsored_slot_dates on public.ai_market_sponsored_orders(slot,status,starts_at,ends_at);
alter table public.ai_market_vendor_claims enable row level security;
alter table public.ai_market_sponsored_orders enable row level security;
revoke all on public.ai_market_vendor_claims,public.ai_market_sponsored_orders from anon,authenticated;
-- Payment confirmation MUST come from existing verified provider webhook + immutable ledger.
-- A client-submitted 'success' is NEVER payment proof.
