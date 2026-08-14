-- WeChat Mini Program identity, opaque sessions and auditable virtual-payment events.
-- Run once in Supabase SQL Editor before enabling the mini-program API routes.

create table if not exists public.wechat_mini_identities (
  openid text primary key,
  unionid text,
  user_id uuid not null references auth.users(id) on delete cascade,
  encrypted_session_key text not null,
  session_key_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists wechat_mini_identity_user_idx
  on public.wechat_mini_identities (user_id);
create index if not exists wechat_mini_identity_unionid_idx
  on public.wechat_mini_identities (unionid) where unionid is not null;

create table if not exists public.wechat_mini_sessions (
  token_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  openid text not null references public.wechat_mini_identities(openid) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists wechat_mini_sessions_user_idx
  on public.wechat_mini_sessions (user_id);
create index if not exists wechat_mini_sessions_expiry_idx
  on public.wechat_mini_sessions (expires_at);

create table if not exists public.wechat_mini_payment_events (
  id bigserial primary key,
  event_type text not null,
  out_trade_no text,
  order_id uuid references public.orders(id) on delete set null,
  transaction_id text,
  payload jsonb not null,
  handled boolean not null default false,
  created_at timestamptz not null default now(),
  unique (event_type, out_trade_no, transaction_id)
);

alter table public.wechat_mini_identities enable row level security;
alter table public.wechat_mini_sessions enable row level security;
alter table public.wechat_mini_payment_events enable row level security;

revoke all on table public.wechat_mini_identities from anon, authenticated;
revoke all on table public.wechat_mini_sessions from anon, authenticated;
revoke all on table public.wechat_mini_payment_events from anon, authenticated;

-- Mini APIs use the service role after validating an opaque bearer session.
grant all on table public.wechat_mini_identities to service_role;
grant all on table public.wechat_mini_sessions to service_role;
grant all on table public.wechat_mini_payment_events to service_role;
grant usage, select on sequence public.wechat_mini_payment_events_id_seq to service_role;

alter table public.orders add column if not exists channel text;
create unique index if not exists orders_provider_payment_unique_idx
  on public.orders (provider, provider_payment_id)
  where provider_payment_id is not null;

\n