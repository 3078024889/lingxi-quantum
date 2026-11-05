-- Ephemeral CI-only money source fixture. No Supabase or real payment calls.
create role anon;
create role authenticated;
create role service_role;
create table public.sasi_wallets(user_id uuid primary key,available_points bigint not null default 0,refundable_points bigint not null default 0);
create table public.ai_wallets(user_id uuid primary key,available_fen bigint not null default 0,refundable_fen bigint not null default 0);
create table public.sasi_usd_wallets(user_id uuid primary key,available_cents bigint not null default 0,refundable_cents bigint not null default 0);
create table public.ai_usd_wallets(user_id uuid primary key,available_cents bigint not null default 0,refundable_cents bigint not null default 0);
-- Distinct original balance and refundable-principal proportions by currency.
insert into public.sasi_wallets values ('a0000000-0000-4000-8000-000000000001',2000,2000);
insert into public.ai_wallets values ('a0000000-0000-4000-8000-000000000001',10000,5000);
insert into public.sasi_usd_wallets values ('a0000000-0000-4000-8000-000000000001',2000,2000);
insert into public.ai_usd_wallets values ('a0000000-0000-4000-8000-000000000001',10000,3000);
create table public.test_toolpass_charges(reference_id text primary key,user_id uuid not null,currency text not null,minor bigint not null);
create function public.charge_sasi_usage_v49(
 p_user_id uuid,p_currency text,p_amount_minor bigint,p_reference_id text,p_kind text,p_metadata jsonb
) returns jsonb language plpgsql as $$
declare
 active_amount bigint;
 legacy_amount bigint;
 active_balance bigint;
 legacy_balance bigint;
begin
 if p_user_id is null or p_amount_minor<1 then return jsonb_build_object('ok',false,'error','BAD_AMOUNT');end if;
 insert into public.test_toolpass_charges values(p_reference_id,p_user_id,p_currency,p_amount_minor)
 on conflict do nothing;
 if not found then return jsonb_build_object('ok',true,'alreadyCharged',true,'chargedMinor',p_amount_minor);end if;
 if p_currency='CNY' then
  select available_points into active_balance from public.sasi_wallets where user_id=p_user_id;
  select available_fen into legacy_balance from public.ai_wallets where user_id=p_user_id;
 else
  select available_cents into active_balance from public.sasi_usd_wallets where user_id=p_user_id;
  select available_cents into legacy_balance from public.ai_usd_wallets where user_id=p_user_id;
 end if;
 active_amount:=least(coalesce(active_balance,0),p_amount_minor);
 legacy_amount:=p_amount_minor-active_amount;
 if coalesce(active_balance,0)+coalesce(legacy_balance,0)<p_amount_minor then
  raise exception 'TEST_FAKE_WALLET_INSUFFICIENT';
 end if;
 if p_currency='CNY' then
  update public.sasi_wallets set available_points=available_points-active_amount,refundable_points=greatest(0,refundable_points-active_amount) where user_id=p_user_id;
  update public.ai_wallets set available_fen=available_fen-legacy_amount,refundable_fen=greatest(0,refundable_fen-legacy_amount) where user_id=p_user_id;
 else
  update public.sasi_usd_wallets set available_cents=available_cents-active_amount,refundable_cents=greatest(0,refundable_cents-active_amount) where user_id=p_user_id;
  update public.ai_usd_wallets set available_cents=available_cents-legacy_amount,refundable_cents=greatest(0,refundable_cents-legacy_amount) where user_id=p_user_id;
 end if;
 return jsonb_build_object('ok',true,'alreadyCharged',false,'chargedMinor',p_amount_minor,
  'activeChargedMinor',active_amount,'legacyChargedMinor',legacy_amount);
end $$;
