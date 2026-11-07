-- Isolated PostgreSQL 17 testing only. No production accounts or provider calls.
create role anon;
create role authenticated;
create role service_role;
create table public.sasi_wallets(
 user_id uuid primary key,available_points bigint not null default 0,
 reserved_points bigint not null default 0,refundable_points bigint not null default 0,
 refund_hold_points bigint not null default 0,updated_at timestamptz not null default now());
create table public.ai_wallets(
 user_id uuid primary key,available_fen bigint not null default 0,
 reserved_fen bigint not null default 0,refundable_fen bigint not null default 0,
 refund_hold_fen bigint not null default 0,bonus_available_fen bigint not null default 0,
 bonus_reserved_fen bigint not null default 0,adjustment_debt_fen bigint not null default 0,
 updated_at timestamptz not null default now());
create table public.sasi_usd_wallets(
 user_id uuid primary key,available_cents bigint not null default 0,
 reserved_cents bigint not null default 0,refundable_cents bigint not null default 0,
 refund_hold_cents bigint not null default 0,updated_at timestamptz not null default now());
create table public.ai_usd_wallets(
 user_id uuid primary key,available_cents bigint not null default 0,
 reserved_cents bigint not null default 0,refundable_cents bigint not null default 0,
 refund_hold_cents bigint not null default 0,updated_at timestamptz not null default now());

create table public.sasi_credit_ledger(
 id uuid primary key default gen_random_uuid(),user_id uuid,kind text,
 delta_available bigint default 0,delta_reserved bigint default 0,delta_refundable bigint default 0,
 available_after bigint default 0,reserved_after bigint default 0,refundable_after bigint default 0,
 refund_hold_after bigint default 0,reference_id text,metadata jsonb default '{}'::jsonb,
 constraint sasi_ledger_kind_check check(kind in ('usage_v49','refund')),
 unique(kind,reference_id));
create table public.ai_wallet_ledger(
 id uuid primary key default gen_random_uuid(),user_id uuid,kind text,
 delta_available_fen bigint default 0,delta_refundable_fen bigint default 0,
 available_after_fen bigint default 0,reserved_after_fen bigint default 0,
 refundable_after_fen bigint default 0,refund_hold_after_fen bigint default 0,
 bonus_available_after_fen bigint default 0,bonus_reserved_after_fen bigint default 0,
 debt_after_fen bigint default 0,reference_id text,metadata jsonb default '{}'::jsonb,
 constraint ai_wallet_ledger_kind_check check(kind in ('topup','usage_v49','refund_complete')));
create table public.sasi_usd_wallet_ledger(
 id uuid primary key default gen_random_uuid(),user_id uuid,kind text,
 delta_available_cents bigint default 0,delta_reserved_cents bigint default 0,
 delta_refundable_cents bigint default 0,available_after_cents bigint default 0,
 reserved_after_cents bigint default 0,refundable_after_cents bigint default 0,
 refund_hold_after_cents bigint default 0,reference_id text,metadata jsonb default '{}'::jsonb);
create table public.ai_usd_wallet_ledger(
 id uuid primary key default gen_random_uuid(),user_id uuid,kind text,
 delta_cents bigint default 0,delta_refundable_cents bigint default 0,
 available_after_cents bigint default 0,refundable_after_cents bigint default 0,
 refund_hold_after_cents bigint default 0,reserved_after_cents bigint default 0,
 reference_id text,metadata jsonb default '{}'::jsonb);

insert into public.sasi_wallets(user_id,available_points,refundable_points)
 values('a0000000-0000-4000-8000-000000000001',2000,2000);
insert into public.ai_wallets(user_id,available_fen,refundable_fen)
 values('a0000000-0000-4000-8000-000000000001',10000,5000);
insert into public.sasi_usd_wallets(user_id,available_cents,refundable_cents)
 values('a0000000-0000-4000-8000-000000000001',2000,2000);
insert into public.ai_usd_wallets(user_id,available_cents,refundable_cents)
 values('a0000000-0000-4000-8000-000000000001',10000,3000);

create table public.test_toolpass_charges(
 reference_id text primary key,user_id uuid not null,currency text not null,minor bigint not null);
create function public.charge_sasi_usage_v49(
 p_user_id uuid,p_currency text,p_amount_minor bigint,p_reference_id text,p_kind text,p_metadata jsonb
) returns jsonb language plpgsql as $$
declare
 active_amount bigint; legacy_amount bigint;
 active_balance bigint; legacy_balance bigint;
 ref_active_before bigint;ref_legacy_before bigint;
 s public.sasi_wallets%rowtype;a public.ai_wallets%rowtype;
 u public.sasi_usd_wallets%rowtype;d public.ai_usd_wallets%rowtype;
begin
 if p_user_id is null or p_amount_minor<1 then
  return jsonb_build_object('ok',false,'error','BAD_AMOUNT');end if;
 insert into public.test_toolpass_charges values(p_reference_id,p_user_id,p_currency,p_amount_minor)
 on conflict do nothing;
 if not found then return jsonb_build_object('ok',true,'alreadyCharged',true,
  'chargedMinor',p_amount_minor);end if;
 if p_currency='CNY' then
  select * into s from public.sasi_wallets where user_id=p_user_id for update;
  select * into a from public.ai_wallets where user_id=p_user_id for update;
  active_balance:=coalesce(s.available_points,0);legacy_balance:=coalesce(a.available_fen,0);
  ref_active_before:=coalesce(s.refundable_points,0);ref_legacy_before:=coalesce(a.refundable_fen,0);
 else
  select * into u from public.sasi_usd_wallets where user_id=p_user_id for update;
  select * into d from public.ai_usd_wallets where user_id=p_user_id for update;
  active_balance:=coalesce(u.available_cents,0);legacy_balance:=coalesce(d.available_cents,0);
  ref_active_before:=coalesce(u.refundable_cents,0);ref_legacy_before:=coalesce(d.refundable_cents,0);
 end if;
 active_amount:=least(active_balance,p_amount_minor);
 legacy_amount:=p_amount_minor-active_amount;
 if active_balance+legacy_balance<p_amount_minor then
  raise exception 'TEST_FAKE_WALLET_INSUFFICIENT';end if;
 if p_currency='CNY' then
  if active_amount>0 then
   update public.sasi_wallets set available_points=available_points-active_amount,
    refundable_points=greatest(0,refundable_points-active_amount)
    where user_id=p_user_id returning * into s;
   insert into public.sasi_credit_ledger(user_id,kind,delta_available,delta_refundable,
    available_after,reserved_after,refundable_after,refund_hold_after,reference_id)
   values(p_user_id,'usage_v49',-active_amount,s.refundable_points-ref_active_before,
    s.available_points,s.reserved_points,s.refundable_points,s.refund_hold_points,p_reference_id);
  end if;
  if legacy_amount>0 then
   update public.ai_wallets set available_fen=available_fen-legacy_amount,
    refundable_fen=greatest(0,refundable_fen-legacy_amount)
    where user_id=p_user_id returning * into a;
   insert into public.ai_wallet_ledger(user_id,kind,delta_available_fen,delta_refundable_fen,
    available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
    bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id)
   values(p_user_id,'usage_v49',-legacy_amount,a.refundable_fen-ref_legacy_before,
    a.available_fen,a.reserved_fen,a.refundable_fen,a.refund_hold_fen,
    a.bonus_available_fen,a.bonus_reserved_fen,a.adjustment_debt_fen,p_reference_id);
  end if;
 else
  if active_amount>0 then
   update public.sasi_usd_wallets set available_cents=available_cents-active_amount,
    refundable_cents=greatest(0,refundable_cents-active_amount)
    where user_id=p_user_id returning * into u;
   insert into public.sasi_usd_wallet_ledger(user_id,kind,delta_available_cents,delta_refundable_cents,
    available_after_cents,reserved_after_cents,refundable_after_cents,refund_hold_after_cents,reference_id)
   values(p_user_id,'usage_v49',-active_amount,u.refundable_cents-ref_active_before,
    u.available_cents,u.reserved_cents,u.refundable_cents,u.refund_hold_cents,p_reference_id);
  end if;
  if legacy_amount>0 then
   update public.ai_usd_wallets set available_cents=available_cents-legacy_amount,
    refundable_cents=greatest(0,refundable_cents-legacy_amount)
    where user_id=p_user_id returning * into d;
   insert into public.ai_usd_wallet_ledger(user_id,kind,delta_cents,delta_refundable_cents,
    available_after_cents,refundable_after_cents,refund_hold_after_cents,reserved_after_cents,reference_id)
   values(p_user_id,'usage_v49',-legacy_amount,d.refundable_cents-ref_legacy_before,
    d.available_cents,d.refundable_cents,d.refund_hold_cents,d.reserved_cents,p_reference_id);
  end if;
 end if;
 return jsonb_build_object('ok',true,'alreadyCharged',false,
  'chargedMinor',p_amount_minor,'activeChargedMinor',active_amount,'legacyChargedMinor',legacy_amount);
end $$;
