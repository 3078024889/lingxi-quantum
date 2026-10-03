-- LINGXIFIELD V52A MONEY INTEGRITY MASTER
-- Additive only. No historical financial table is dropped.
-- Provider success is never inferred from local state.

alter table public.balance_withdrawals
  add column if not exists provider_request_key text,
  add column if not exists provider_attempt_count integer not null default 0,
  add column if not exists last_provider_checked_at timestamptz,
  add column if not exists next_reconcile_at timestamptz,
  add column if not exists provider_raw_status text,
  add column if not exists last_provider_error_code text;

update public.balance_withdrawals
set provider_request_key = coalesce(provider_request_key,'lf-refund-'||id::text)
where provider_request_key is null;

update public.balance_withdrawals
set next_reconcile_at = coalesce(next_reconcile_at,now())
where status in ('requested','processing')
  and completed_at is null;

alter table public.balance_withdrawals
  alter column provider_request_key set not null;

do $$
begin
  if not exists(
    select 1 from pg_constraint
    where conname='balance_withdrawals_provider_attempt_count_nonnegative'
  ) then
    alter table public.balance_withdrawals
      add constraint balance_withdrawals_provider_attempt_count_nonnegative
      check(provider_attempt_count>=0);
  end if;
end $$;

create unique index if not exists balance_withdrawals_provider_request_key_uidx
  on public.balance_withdrawals(provider_request_key);

create index if not exists balance_withdrawals_reconcile_idx
  on public.balance_withdrawals(status,next_reconcile_at,created_at)
  where status in ('requested','processing');

create or replace function public.money_balance_snapshot_v52(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare
  cny_ai public.ai_wallets%rowtype;
  cny_sasi public.sasi_wallets%rowtype;
  usd_ai public.ai_usd_wallets%rowtype;
  usd_sasi public.sasi_usd_wallets%rowtype;
begin
  if p_user_id is null then
    raise exception 'USER_REQUIRED';
  end if;
  if auth.uid() is distinct from p_user_id and coalesce(auth.role(),'')<>'service_role' then
    raise exception 'FORBIDDEN';
  end if;

  select * into cny_ai from public.ai_wallets where user_id=p_user_id;
  select * into cny_sasi from public.sasi_wallets where user_id=p_user_id;
  select * into usd_ai from public.ai_usd_wallets where user_id=p_user_id;
  select * into usd_sasi from public.sasi_usd_wallets where user_id=p_user_id;

  return jsonb_build_object(
    'cny_available_minor',coalesce(cny_ai.available_fen,0)+coalesce(cny_sasi.available_points,0),
    'cny_refundable_minor',coalesce(cny_ai.refundable_fen,0)+coalesce(cny_sasi.refundable_points,0),
    'cny_refund_hold_minor',coalesce(cny_ai.refund_hold_fen,0)+coalesce(cny_sasi.refund_hold_points,0),
    'cny_legacy_available_minor',coalesce(cny_ai.available_fen,0),
    'cny_active_available_minor',coalesce(cny_sasi.available_points,0),
    'usd_available_minor',coalesce(usd_ai.available_cents,0)+coalesce(usd_sasi.available_cents,0),
    'usd_refundable_minor',coalesce(usd_ai.refundable_cents,0)+coalesce(usd_sasi.refundable_cents,0),
    'usd_refund_hold_minor',coalesce(usd_ai.refund_hold_cents,0)+coalesce(usd_sasi.refund_hold_cents,0),
    'usd_legacy_available_minor',coalesce(usd_ai.available_cents,0),
    'usd_active_available_minor',coalesce(usd_sasi.available_cents,0)
  );
end $$;

revoke all on function public.money_balance_snapshot_v52(uuid) from public,anon;
grant execute on function public.money_balance_snapshot_v52(uuid) to authenticated,service_role;

create or replace function public.money_reconciliation_candidates_v52(p_limit integer default 50)
returns setof public.balance_withdrawals
language sql
security definer
set search_path='public','pg_temp'
as $$
  select *
  from public.balance_withdrawals
  where status in ('requested','processing')
    and completed_at is null
    and coalesce(next_reconcile_at,created_at)<=now()
  order by coalesce(next_reconcile_at,created_at),created_at
  limit greatest(1,least(coalesce(p_limit,50),200))
$$;

revoke all on function public.money_reconciliation_candidates_v52(integer) from public,anon,authenticated;
grant execute on function public.money_reconciliation_candidates_v52(integer) to service_role;

create or replace function public.money_record_provider_observation_v52(
  p_withdrawal_id uuid,
  p_provider_status text,
  p_provider_raw_status text,
  p_provider_refund_id text,
  p_error_code text,
  p_retry_after_seconds integer default 300
)
returns jsonb
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare
  w public.balance_withdrawals%rowtype;
  retry_seconds integer:=greatest(30,least(coalesce(p_retry_after_seconds,300),86400));
begin
  if coalesce(auth.role(),'')<>'service_role' then
    raise exception 'FORBIDDEN';
  end if;

  select * into w
  from public.balance_withdrawals
  where id=p_withdrawal_id
  for update;

  if not found then return jsonb_build_object('ok',false,'error','WITHDRAWAL_NOT_FOUND'); end if;
  if w.status in ('completed','failed','rejected') then
    return jsonb_build_object('ok',true,'closed',true,'status',w.status);
  end if;

  update public.balance_withdrawals
  set provider_status=coalesce(nullif(p_provider_status,''),provider_status),
      provider_raw_status=left(coalesce(p_provider_raw_status,''),500),
      provider_refund_id=coalesce(nullif(p_provider_refund_id,''),provider_refund_id),
      last_provider_error_code=left(coalesce(p_error_code,''),120),
      provider_attempt_count=provider_attempt_count+1,
      last_provider_checked_at=now(),
      next_reconcile_at=now()+make_interval(secs=>retry_seconds),
      updated_at=now()
  where id=p_withdrawal_id;

  return jsonb_build_object('ok',true,'status','recorded','retryAfterSeconds',retry_seconds);
end $$;

revoke all on function public.money_record_provider_observation_v52(uuid,text,text,text,text,integer)
from public,anon,authenticated;
grant execute on function public.money_record_provider_observation_v52(uuid,text,text,text,text,integer)
to service_role;

comment on function public.money_reconciliation_candidates_v52(integer)
is 'V52A service-role only queue reader. It does not complete or release money. Provider facts must be checked first.';

comment on function public.money_record_provider_observation_v52(uuid,text,text,text,text,integer)
is 'V52A stores provider observations only. Final money movement remains complete_balance_withdrawal/release_balance_withdrawal.';

-- Explicitly schedule the current legacy/stuck rows for reconciliation without
-- guessing provider outcome.
update public.balance_withdrawals
set next_reconcile_at=now()
where status='processing'
  and provider_refund_id is null
  and completed_at is null;
