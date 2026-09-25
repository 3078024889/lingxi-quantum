-- Production migration already applied as 20260924231858.
-- Adds the withdrawal state machine and refundable principal accounting.
begin;

alter table public.sasi_wallets
  add column if not exists refundable_points bigint not null default 0,
  add column if not exists refund_hold_points bigint not null default 0,
  add column if not exists lifetime_topup_points bigint not null default 0;

alter table public.ai_usd_wallets
  add column if not exists refund_hold_cents bigint not null default 0;

alter table public.sasi_usd_wallets
  add column if not exists refundable_cents bigint not null default 0,
  add column if not exists refund_hold_cents bigint not null default 0,
  add column if not exists lifetime_topup_cents bigint not null default 0;

alter table public.sasi_credit_ledger
  add column if not exists delta_refundable bigint not null default 0,
  add column if not exists delta_refund_hold bigint not null default 0,
  add column if not exists refundable_after bigint not null default 0,
  add column if not exists refund_hold_after bigint not null default 0;

alter table public.ai_usd_wallet_ledger
  add column if not exists delta_refundable_cents bigint not null default 0,
  add column if not exists delta_refund_hold_cents bigint not null default 0,
  add column if not exists refundable_after_cents bigint not null default 0,
  add column if not exists refund_hold_after_cents bigint not null default 0;

alter table public.sasi_usd_wallet_ledger
  add column if not exists delta_refundable_cents bigint not null default 0,
  add column if not exists delta_refund_hold_cents bigint not null default 0,
  add column if not exists refundable_after_cents bigint not null default 0,
  add column if not exists refund_hold_after_cents bigint not null default 0;

create table if not exists public.balance_withdrawals(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete restrict,
  wallet_kind text not null check(wallet_kind in ('ai_cny','ai_usd','sasi_cny','sasi_usd')),
  provider text not null check(provider in ('paypal','alipay','wechat')),
  currency text not null check(currency in ('CNY','USD')),
  amount_minor bigint not null check(amount_minor>0),
  status text not null default 'requested' check(status in ('requested','processing','completed','rejected','failed')),
  provider_refund_id text,
  provider_status text,
  failure_code text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists balance_withdrawals_user_created_idx on public.balance_withdrawals(user_id,created_at desc);
create index if not exists balance_withdrawals_order_idx on public.balance_withdrawals(order_id);
create unique index if not exists balance_withdrawals_one_active_per_order_idx
  on public.balance_withdrawals(order_id) where status in ('requested','processing');

alter table public.balance_withdrawals enable row level security;
revoke all on public.balance_withdrawals from public,anon;
revoke insert,update,delete on public.balance_withdrawals from authenticated;
grant select on public.balance_withdrawals to authenticated;
grant select,insert,update,delete on public.balance_withdrawals to service_role;

drop policy if exists "users read own balance withdrawals" on public.balance_withdrawals;
create policy "users read own balance withdrawals"
  on public.balance_withdrawals for select to authenticated
  using ((select auth.uid())=user_id);

-- Function bodies are intentionally synchronized from production by the following migration
-- package acceptance checks. Production is the source of truth for this already-applied version.
commit;
