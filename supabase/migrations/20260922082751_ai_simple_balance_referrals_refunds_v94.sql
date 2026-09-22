
create table if not exists public.ai_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available_fen bigint not null default 0 check (available_fen >= 0),
  reserved_fen bigint not null default 0 check (reserved_fen >= 0),
  refundable_fen bigint not null default 0 check (refundable_fen >= 0),
  bonus_available_fen bigint not null default 0 check (bonus_available_fen >= 0),
  bonus_reserved_fen bigint not null default 0 check (bonus_reserved_fen >= 0),
  balance_basis_fen bigint not null default 0 check (balance_basis_fen >= 0),
  lifetime_topup_fen bigint not null default 0 check (lifetime_topup_fen >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_wallets add column if not exists bonus_available_fen bigint not null default 0;
alter table public.ai_wallets add column if not exists bonus_reserved_fen bigint not null default 0;
alter table public.ai_wallets add column if not exists balance_basis_fen bigint not null default 0;
alter table public.ai_wallets add column if not exists lifetime_topup_fen bigint not null default 0;

create table if not exists public.ai_wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  delta_available_fen bigint not null default 0,
  delta_reserved_fen bigint not null default 0,
  delta_refundable_fen bigint not null default 0,
  delta_bonus_available_fen bigint not null default 0,
  delta_bonus_reserved_fen bigint not null default 0,
  available_after_fen bigint not null default 0,
  reserved_after_fen bigint not null default 0,
  refundable_after_fen bigint not null default 0,
  bonus_available_after_fen bigint not null default 0,
  bonus_reserved_after_fen bigint not null default 0,
  reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.ai_wallet_ledger add column if not exists delta_bonus_available_fen bigint not null default 0;
alter table public.ai_wallet_ledger add column if not exists delta_bonus_reserved_fen bigint not null default 0;
alter table public.ai_wallet_ledger add column if not exists bonus_available_after_fen bigint not null default 0;
alter table public.ai_wallet_ledger add column if not exists bonus_reserved_after_fen bigint not null default 0;

create index if not exists ai_wallet_ledger_user_created_idx on public.ai_wallet_ledger(user_id,created_at desc);

create table if not exists public.ai_requests (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_kind text not null,
  intelligence text not null default 'standard' check (intelligence in ('light','standard','high')),
  provider text,
  model text,
  state text not null default 'reserved' check (state in ('reserved','completed','failed')),
  reserved_fen bigint not null default 0,
  reserved_principal_fen bigint not null default 0,
  reserved_bonus_fen bigint not null default 0,
  charged_fen bigint not null default 0,
  charged_principal_fen bigint not null default 0,
  charged_bonus_fen bigint not null default 0,
  provider_cost_fen numeric(14,6) not null default 0,
  input_tokens bigint,
  output_tokens bigint,
  cached_tokens bigint,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.ai_requests add column if not exists intelligence text not null default 'standard';
alter table public.ai_requests add column if not exists reserved_principal_fen bigint not null default 0;
alter table public.ai_requests add column if not exists reserved_bonus_fen bigint not null default 0;
alter table public.ai_requests add column if not exists charged_principal_fen bigint not null default 0;
alter table public.ai_requests add column if not exists charged_bonus_fen bigint not null default 0;
create index if not exists ai_requests_user_created_idx on public.ai_requests(user_id,created_at desc);

create table if not exists public.ai_referral_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_referrals (
  referred_user_id uuid primary key references auth.users(id) on delete cascade,
  inviter_user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  claimed_at timestamptz not null default now(),
  constraint ai_referrals_not_self check (referred_user_id <> inviter_user_id)
);
create index if not exists ai_referrals_inviter_idx on public.ai_referrals(inviter_user_id);

create table if not exists public.ai_referral_rewards (
  order_id uuid primary key references public.orders(id) on delete cascade,
  inviter_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade,
  topup_fen bigint not null,
  bonus_fen bigint not null,
  status text not null default 'credited' check(status in ('credited','reversed')),
  created_at timestamptz not null default now(),
  reversed_at timestamptz
);

create table if not exists public.ai_refund_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_fen bigint not null check(amount_fen>0),
  status text not null default 'requested' check(status in ('requested','approved','rejected','completed')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_wallets enable row level security;
alter table public.ai_wallet_ledger enable row level security;
alter table public.ai_requests enable row level security;
alter table public.ai_referral_codes enable row level security;
alter table public.ai_referrals enable row level security;
alter table public.ai_referral_rewards enable row level security;
alter table public.ai_refund_requests enable row level security;

drop policy if exists "users read own ai wallet" on public.ai_wallets;
create policy "users read own ai wallet" on public.ai_wallets for select using(auth.uid()=user_id);
drop policy if exists "users read own ai ledger" on public.ai_wallet_ledger;
create policy "users read own ai ledger" on public.ai_wallet_ledger for select using(auth.uid()=user_id);
drop policy if exists "users read own ai requests" on public.ai_requests;
create policy "users read own ai requests" on public.ai_requests for select using(auth.uid()=user_id);
drop policy if exists "users read own ai referral code" on public.ai_referral_codes;
create policy "users read own ai referral code" on public.ai_referral_codes for select using(auth.uid()=user_id);
drop policy if exists "users read own referrals" on public.ai_referrals;
create policy "users read own referrals" on public.ai_referrals for select using(auth.uid()=referred_user_id or auth.uid()=inviter_user_id);
drop policy if exists "users read own referral rewards" on public.ai_referral_rewards;
create policy "users read own referral rewards" on public.ai_referral_rewards for select using(auth.uid()=inviter_user_id or auth.uid()=referred_user_id);
drop policy if exists "users read own refund requests" on public.ai_refund_requests;
create policy "users read own refund requests" on public.ai_refund_requests for select using(auth.uid()=user_id);

create or replace function public.ai_wallet_snapshot(p_user_id uuid)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare v public.ai_wallets%rowtype;
begin
  insert into public.ai_wallets(user_id) values(p_user_id) on conflict do nothing;
  select * into v from public.ai_wallets where user_id=p_user_id;
  return jsonb_build_object(
    'principal_fen',v.available_fen,
    'principal_reserved_fen',v.reserved_fen,
    'refundable_fen',v.refundable_fen,
    'bonus_fen',v.bonus_available_fen,
    'bonus_reserved_fen',v.bonus_reserved_fen,
    'basis_fen',v.balance_basis_fen,
    'lifetime_topup_fen',v.lifetime_topup_fen,
    'total_available_fen',v.available_fen+v.bonus_available_fen
  );
end $$;

create or replace function public.reserve_ai_funds(
 p_user_id uuid,p_request_id uuid,p_task_kind text,p_intelligence text,p_max_fen bigint
)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
 v public.ai_wallets%rowtype;
 v_bonus bigint; v_principal bigint;
begin
 if p_intelligence not in ('light','standard','high') then return jsonb_build_object('ok',false,'error','INVALID_INTELLIGENCE'); end if;
 if p_max_fen<=0 then return jsonb_build_object('ok',false,'error','INVALID_RESERVE'); end if;
 insert into public.ai_wallets(user_id) values(p_user_id) on conflict do nothing;
 select * into v from public.ai_wallets where user_id=p_user_id for update;
 if exists(select 1 from public.ai_requests where id=p_request_id) then return jsonb_build_object('ok',true,'existing',true); end if;
 if v.available_fen+v.bonus_available_fen<p_max_fen then
   return jsonb_build_object('ok',false,'error','INSUFFICIENT_BALANCE','total_available_fen',v.available_fen+v.bonus_available_fen);
 end if;

 v_bonus:=least(v.bonus_available_fen,p_max_fen);
 v_principal:=p_max_fen-v_bonus;

 update public.ai_wallets set
   bonus_available_fen=bonus_available_fen-v_bonus,
   bonus_reserved_fen=bonus_reserved_fen+v_bonus,
   available_fen=available_fen-v_principal,
   reserved_fen=reserved_fen+v_principal,
   updated_at=now()
 where user_id=p_user_id returning * into v;

 insert into public.ai_requests(id,user_id,task_kind,intelligence,reserved_fen,reserved_principal_fen,reserved_bonus_fen,state)
 values(p_request_id,p_user_id,p_task_kind,p_intelligence,p_max_fen,v_principal,v_bonus,'reserved');

 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_reserved_fen,delta_refundable_fen,
  delta_bonus_available_fen,delta_bonus_reserved_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,
  reference_id,metadata
 ) values(
  p_user_id,'reserve',-v_principal,v_principal,0,-v_bonus,v_bonus,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.bonus_available_fen,v.bonus_reserved_fen,
  p_request_id::text,jsonb_build_object('intelligence',p_intelligence,'maxFen',p_max_fen)
 );
 return jsonb_build_object('ok',true,'reserved_fen',p_max_fen,'bonus_reserved_fen',v_bonus,'principal_reserved_fen',v_principal);
end $$;

create or replace function public.settle_ai_funds(
 p_user_id uuid,p_request_id uuid,p_charge_fen bigint,p_provider text,p_model text,p_provider_cost_fen numeric,
 p_input_tokens bigint,p_output_tokens bigint,p_cached_tokens bigint
)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
 r public.ai_requests%rowtype; v public.ai_wallets%rowtype;
 charge_bonus bigint; charge_principal bigint; refund_bonus bigint; refund_principal bigint;
begin
 select * into r from public.ai_requests where id=p_request_id and user_id=p_user_id for update;
 if not found then return jsonb_build_object('ok',false,'error','REQUEST_NOT_FOUND'); end if;
 if r.state='completed' then return jsonb_build_object('ok',true,'already_settled',true,'charged_fen',r.charged_fen); end if;
 if p_charge_fen<0 or p_charge_fen>r.reserved_fen then return jsonb_build_object('ok',false,'error','INVALID_CHARGE'); end if;

 charge_bonus:=least(r.reserved_bonus_fen,p_charge_fen);
 charge_principal:=p_charge_fen-charge_bonus;
 refund_bonus:=r.reserved_bonus_fen-charge_bonus;
 refund_principal:=r.reserved_principal_fen-charge_principal;

 select * into v from public.ai_wallets where user_id=p_user_id for update;
 update public.ai_wallets set
   bonus_available_fen=bonus_available_fen+refund_bonus,
   bonus_reserved_fen=greatest(0,bonus_reserved_fen-r.reserved_bonus_fen),
   available_fen=available_fen+refund_principal,
   reserved_fen=greatest(0,reserved_fen-r.reserved_principal_fen),
   refundable_fen=greatest(0,refundable_fen-charge_principal),
   updated_at=now()
 where user_id=p_user_id returning * into v;

 update public.ai_requests set
   provider=p_provider,model=p_model,state='completed',charged_fen=p_charge_fen,
   charged_principal_fen=charge_principal,charged_bonus_fen=charge_bonus,
   provider_cost_fen=p_provider_cost_fen,input_tokens=p_input_tokens,output_tokens=p_output_tokens,
   cached_tokens=p_cached_tokens,completed_at=now()
 where id=p_request_id;

 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_reserved_fen,delta_refundable_fen,
  delta_bonus_available_fen,delta_bonus_reserved_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,
  reference_id,metadata
 ) values(
  p_user_id,'settle',refund_principal,-r.reserved_principal_fen,-charge_principal,
  refund_bonus,-r.reserved_bonus_fen,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.bonus_available_fen,v.bonus_reserved_fen,
  p_request_id::text,jsonb_build_object('chargeFen',p_charge_fen,'chargePrincipalFen',charge_principal,'chargeBonusFen',charge_bonus,'provider',p_provider,'model',p_model)
 );
 return jsonb_build_object('ok',true,'charged_fen',p_charge_fen,'charged_bonus_fen',charge_bonus,'charged_principal_fen',charge_principal);
end $$;

create or replace function public.release_ai_funds(p_user_id uuid,p_request_id uuid,p_error_code text default null)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.ai_requests%rowtype; v public.ai_wallets%rowtype;
begin
 select * into r from public.ai_requests where id=p_request_id and user_id=p_user_id for update;
 if not found then return jsonb_build_object('ok',false,'error','REQUEST_NOT_FOUND'); end if;
 if r.state<>'reserved' then return jsonb_build_object('ok',true,'already_released',true); end if;

 update public.ai_wallets set
   available_fen=available_fen+r.reserved_principal_fen,
   reserved_fen=greatest(0,reserved_fen-r.reserved_principal_fen),
   bonus_available_fen=bonus_available_fen+r.reserved_bonus_fen,
   bonus_reserved_fen=greatest(0,bonus_reserved_fen-r.reserved_bonus_fen),
   updated_at=now()
 where user_id=p_user_id returning * into v;

 update public.ai_requests set state='failed',error_code=left(coalesce(p_error_code,'FAILED'),120),completed_at=now() where id=p_request_id;

 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_reserved_fen,delta_refundable_fen,
  delta_bonus_available_fen,delta_bonus_reserved_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,
  reference_id
 ) values(
  p_user_id,'release',r.reserved_principal_fen,-r.reserved_principal_fen,0,
  r.reserved_bonus_fen,-r.reserved_bonus_fen,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.bonus_available_fen,v.bonus_reserved_fen,
  p_request_id::text
 );
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.credit_ai_topup(p_order_id uuid)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
 o public.orders%rowtype; v public.ai_wallets%rowtype;
 amount_fen bigint; expected_rmb numeric;
 ref public.ai_referrals%rowtype; inviter public.ai_wallets%rowtype; reward_fen bigint;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then return jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); end if;

 select x.amount_fen,x.amount_rmb into amount_fen,expected_rmb
 from (values
  ('ai-balance-10'::text,1000::bigint,10::numeric),
  ('ai-balance-30'::text,3000::bigint,30::numeric),
  ('ai-balance-50'::text,5000::bigint,50::numeric),
  ('ai-balance-100'::text,10000::bigint,100::numeric),
  ('ai-balance-300'::text,30000::bigint,300::numeric),
  ('ai-balance-500'::text,50000::bigint,500::numeric)
 ) x(product_id,amount_fen,amount_rmb) where x.product_id=o.product_id;

 if amount_fen is null then return jsonb_build_object('ok',false,'error','INVALID_AI_TOPUP'); end if;
 if o.amount_rmb is null or round(o.amount_rmb,2)<>round(expected_rmb,2) then return jsonb_build_object('ok',false,'error','AMOUNT_MISMATCH'); end if;

 if exists(select 1 from public.ai_wallet_ledger where kind='topup' and reference_id=p_order_id::text) then
   update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;
   return jsonb_build_object('ok',true,'alreadyPaid',true);
 end if;

 insert into public.ai_wallets(user_id) values(o.user_id) on conflict do nothing;
 select * into v from public.ai_wallets where user_id=o.user_id for update;
 update public.ai_wallets set
   available_fen=available_fen+amount_fen,
   refundable_fen=refundable_fen+amount_fen,
   lifetime_topup_fen=lifetime_topup_fen+amount_fen,
   balance_basis_fen=available_fen+bonus_available_fen+amount_fen,
   updated_at=now()
 where user_id=o.user_id returning * into v;

 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_reserved_fen,delta_refundable_fen,
  delta_bonus_available_fen,delta_bonus_reserved_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,
  reference_id,metadata
 ) values(
  o.user_id,'topup',amount_fen,0,amount_fen,0,0,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.bonus_available_fen,v.bonus_reserved_fen,
  p_order_id::text,jsonb_build_object('productId',o.product_id,'provider',o.provider)
 );

 update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;

 -- 每一笔真实充值 >= ¥50：邀请人获得该笔金额 10% 的不可退款 AI 赠送额度。
 if amount_fen>=5000 and not exists(select 1 from public.ai_referral_rewards where order_id=p_order_id) then
   select * into ref from public.ai_referrals where referred_user_id=o.user_id;
   if found then
     reward_fen:=floor(amount_fen*0.10);
     insert into public.ai_wallets(user_id) values(ref.inviter_user_id) on conflict do nothing;
     select * into inviter from public.ai_wallets where user_id=ref.inviter_user_id for update;
     update public.ai_wallets set
       bonus_available_fen=bonus_available_fen+reward_fen,
       balance_basis_fen=available_fen+bonus_available_fen+reward_fen,
       updated_at=now()
     where user_id=ref.inviter_user_id returning * into inviter;
     insert into public.ai_referral_rewards(order_id,inviter_user_id,referred_user_id,topup_fen,bonus_fen)
     values(p_order_id,ref.inviter_user_id,o.user_id,amount_fen,reward_fen);
     insert into public.ai_wallet_ledger(
      user_id,kind,delta_available_fen,delta_reserved_fen,delta_refundable_fen,
      delta_bonus_available_fen,delta_bonus_reserved_fen,
      available_after_fen,reserved_after_fen,refundable_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,
      reference_id,metadata
     ) values(
      ref.inviter_user_id,'referral_bonus',0,0,0,reward_fen,0,
      inviter.available_fen,inviter.reserved_fen,inviter.refundable_fen,inviter.bonus_available_fen,inviter.bonus_reserved_fen,
      p_order_id::text,jsonb_build_object('referredUserId',o.user_id,'topupFen',amount_fen,'rate',0.10)
     );
   end if;
 end if;

 return jsonb_build_object('ok',true,'amountFen',amount_fen,'availableFen',v.available_fen,'bonusFen',v.bonus_available_fen);
end $$;


alter table public.ai_wallet_ledger drop constraint if exists ai_wallet_ledger_kind_check;
alter table public.ai_wallet_ledger
  add constraint ai_wallet_ledger_kind_check
  check (kind in ('topup','reserve','settle','release','refund_request','refund_complete','promo','referral_bonus'));

alter table public.ai_requests drop constraint if exists ai_requests_intelligence_check;
alter table public.ai_requests
  add constraint ai_requests_intelligence_check
  check (intelligence in ('light','standard','high'));

drop function if exists public.reserve_ai_funds(uuid,uuid,text,bigint);
drop function if exists public.ensure_ai_cycle(uuid);
drop function if exists public.use_ai_reset_credit(uuid);

revoke all on function public.ai_wallet_snapshot(uuid) from public,anon,authenticated;
revoke all on function public.reserve_ai_funds(uuid,uuid,text,text,bigint) from public,anon,authenticated;
revoke all on function public.settle_ai_funds(uuid,uuid,bigint,text,text,numeric,bigint,bigint,bigint) from public,anon,authenticated;
revoke all on function public.release_ai_funds(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.credit_ai_topup(uuid) from public,anon,authenticated;
grant execute on function public.ai_wallet_snapshot(uuid) to service_role;
grant execute on function public.reserve_ai_funds(uuid,uuid,text,text,bigint) to service_role;
grant execute on function public.settle_ai_funds(uuid,uuid,bigint,text,text,numeric,bigint,bigint,bigint) to service_role;
grant execute on function public.release_ai_funds(uuid,uuid,text) to service_role;
grant execute on function public.credit_ai_topup(uuid) to service_role;

-- V9.4 refund / chargeback hardening

-- V9.4: extend the V9.2 balance ledger with refund holds, chargeback debt,
-- referral-reward reversal and idempotent top-up reversal.

alter table public.ai_wallets add column if not exists refund_hold_fen bigint not null default 0 check (refund_hold_fen >= 0);
alter table public.ai_wallets add column if not exists adjustment_debt_fen bigint not null default 0 check (adjustment_debt_fen >= 0);

alter table public.ai_wallet_ledger add column if not exists delta_refund_hold_fen bigint not null default 0;
alter table public.ai_wallet_ledger add column if not exists delta_debt_fen bigint not null default 0;
alter table public.ai_wallet_ledger add column if not exists refund_hold_after_fen bigint not null default 0;
alter table public.ai_wallet_ledger add column if not exists debt_after_fen bigint not null default 0;

alter table public.ai_wallet_ledger drop constraint if exists ai_wallet_ledger_kind_check;
alter table public.ai_wallet_ledger
  add constraint ai_wallet_ledger_kind_check
  check (kind in (
    'topup','reserve','settle','release','referral_bonus',
    'refund_hold','refund_release','refund_complete',
    'topup_reversal','referral_reversal','debt_offset'
  ));

alter table public.ai_referral_rewards add column if not exists reversed_bonus_fen bigint not null default 0;
alter table public.ai_referral_rewards drop constraint if exists ai_referral_rewards_status_check;
alter table public.ai_referral_rewards
  add constraint ai_referral_rewards_status_check
  check(status in ('credited','partially_reversed','reversed'));

alter table public.ai_refund_requests add column if not exists order_id uuid references public.orders(id) on delete restrict;
alter table public.ai_refund_requests add column if not exists provider_refund_id text;
create index if not exists ai_refund_requests_user_created_idx on public.ai_refund_requests(user_id,created_at desc);

create table if not exists public.ai_topup_reversals (
  order_id uuid primary key references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_fen bigint not null,
  reason text not null,
  created_at timestamptz not null default now()
);
alter table public.ai_topup_reversals enable row level security;
drop policy if exists "deny client ai topup reversals" on public.ai_topup_reversals;
create policy "deny client ai topup reversals" on public.ai_topup_reversals
for all using (false) with check (false);

create or replace function public.ai_wallet_snapshot(p_user_id uuid)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare v public.ai_wallets%rowtype;
begin
  insert into public.ai_wallets(user_id) values(p_user_id) on conflict do nothing;
  select * into v from public.ai_wallets where user_id=p_user_id;
  return jsonb_build_object(
    'principal_fen',v.available_fen,
    'principal_reserved_fen',v.reserved_fen,
    'refundable_fen',v.refundable_fen,
    'refund_hold_fen',v.refund_hold_fen,
    'bonus_fen',v.bonus_available_fen,
    'bonus_reserved_fen',v.bonus_reserved_fen,
    'debt_fen',v.adjustment_debt_fen,
    'basis_fen',v.balance_basis_fen,
    'lifetime_topup_fen',v.lifetime_topup_fen,
    'total_available_fen',v.available_fen+v.bonus_available_fen
  );
end $$;

create or replace function public.reserve_ai_funds(
 p_user_id uuid,p_request_id uuid,p_task_kind text,p_intelligence text,p_max_fen bigint
)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare v public.ai_wallets%rowtype; v_bonus bigint; v_principal bigint;
begin
 if p_intelligence not in ('light','standard','high') then return jsonb_build_object('ok',false,'error','INVALID_INTELLIGENCE'); end if;
 if p_max_fen<=0 then return jsonb_build_object('ok',false,'error','INVALID_RESERVE'); end if;
 insert into public.ai_wallets(user_id) values(p_user_id) on conflict do nothing;
 select * into v from public.ai_wallets where user_id=p_user_id for update;
 if v.adjustment_debt_fen>0 then return jsonb_build_object('ok',false,'error','ACCOUNT_ADJUSTMENT_REQUIRED','debt_fen',v.adjustment_debt_fen); end if;
 if exists(select 1 from public.ai_requests where id=p_request_id) then return jsonb_build_object('ok',true,'existing',true); end if;
 if v.available_fen+v.bonus_available_fen<p_max_fen then
   return jsonb_build_object('ok',false,'error','INSUFFICIENT_BALANCE','total_available_fen',v.available_fen+v.bonus_available_fen);
 end if;
 v_bonus:=least(v.bonus_available_fen,p_max_fen);
 v_principal:=p_max_fen-v_bonus;
 update public.ai_wallets set
   bonus_available_fen=bonus_available_fen-v_bonus,
   bonus_reserved_fen=bonus_reserved_fen+v_bonus,
   available_fen=available_fen-v_principal,
   reserved_fen=reserved_fen+v_principal,
   updated_at=now()
 where user_id=p_user_id returning * into v;
 insert into public.ai_requests(id,user_id,task_kind,intelligence,reserved_fen,reserved_principal_fen,reserved_bonus_fen,state)
 values(p_request_id,p_user_id,p_task_kind,p_intelligence,p_max_fen,v_principal,v_bonus,'reserved');
 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_reserved_fen,delta_bonus_available_fen,delta_bonus_reserved_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
  bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
 ) values(
  p_user_id,'reserve',-v_principal,v_principal,-v_bonus,v_bonus,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,
  v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,p_request_id::text,
  jsonb_build_object('intelligence',p_intelligence,'maxFen',p_max_fen)
 );
 return jsonb_build_object('ok',true,'reserved_fen',p_max_fen);
end $$;

create or replace function public.credit_ai_topup(p_order_id uuid)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
 o public.orders%rowtype; v public.ai_wallets%rowtype; inviter public.ai_wallets%rowtype; ref public.ai_referrals%rowtype;
 amount_fen bigint; expected_rmb numeric; reward_fen bigint; debt_offset bigint; inviter_offset bigint; net_credit bigint; net_reward bigint;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then return jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); end if;
 select x.amount_fen,x.amount_rmb into amount_fen,expected_rmb
 from (values
  ('ai-balance-10'::text,1000::bigint,10::numeric),
  ('ai-balance-30'::text,3000::bigint,30::numeric),
  ('ai-balance-50'::text,5000::bigint,50::numeric),
  ('ai-balance-100'::text,10000::bigint,100::numeric),
  ('ai-balance-300'::text,30000::bigint,300::numeric),
  ('ai-balance-500'::text,50000::bigint,500::numeric)
 ) x(product_id,amount_fen,amount_rmb) where x.product_id=o.product_id;
 if amount_fen is null then return jsonb_build_object('ok',false,'error','INVALID_AI_TOPUP'); end if;
 if o.amount_rmb is null or round(o.amount_rmb,2)<>round(expected_rmb,2) then return jsonb_build_object('ok',false,'error','AMOUNT_MISMATCH'); end if;
 if exists(select 1 from public.ai_wallet_ledger where kind='topup' and reference_id=p_order_id::text) then
   update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;
   return jsonb_build_object('ok',true,'alreadyPaid',true);
 end if;

 insert into public.ai_wallets(user_id) values(o.user_id) on conflict do nothing;
 select * into v from public.ai_wallets where user_id=o.user_id for update;
 debt_offset:=least(v.adjustment_debt_fen,amount_fen);
 net_credit:=amount_fen-debt_offset;

 update public.ai_wallets set
   adjustment_debt_fen=adjustment_debt_fen-debt_offset,
   available_fen=available_fen+net_credit,
   refundable_fen=refundable_fen+net_credit,
   lifetime_topup_fen=lifetime_topup_fen+amount_fen,
   balance_basis_fen=available_fen+bonus_available_fen+net_credit,
   updated_at=now()
 where user_id=o.user_id returning * into v;

 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_refundable_fen,delta_debt_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
  bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
 ) values(
  o.user_id,'topup',net_credit,net_credit,-debt_offset,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,
  v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,p_order_id::text,
  jsonb_build_object('productId',o.product_id,'provider',o.provider,'grossFen',amount_fen,'debtOffsetFen',debt_offset)
 );
 update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;

 if amount_fen>=5000 and not exists(select 1 from public.ai_referral_rewards where order_id=p_order_id) then
   select * into ref from public.ai_referrals where referred_user_id=o.user_id;
   if found then
     reward_fen:=floor(amount_fen*0.10);
     insert into public.ai_wallets(user_id) values(ref.inviter_user_id) on conflict do nothing;
     select * into inviter from public.ai_wallets where user_id=ref.inviter_user_id for update;
     inviter_offset:=least(inviter.adjustment_debt_fen,reward_fen);
     net_reward:=reward_fen-inviter_offset;
     update public.ai_wallets set
       adjustment_debt_fen=adjustment_debt_fen-inviter_offset,
       bonus_available_fen=bonus_available_fen+net_reward,
       balance_basis_fen=available_fen+bonus_available_fen+net_reward,
       updated_at=now()
     where user_id=ref.inviter_user_id returning * into inviter;
     insert into public.ai_referral_rewards(order_id,inviter_user_id,referred_user_id,topup_fen,bonus_fen)
     values(p_order_id,ref.inviter_user_id,o.user_id,amount_fen,reward_fen);
     insert into public.ai_wallet_ledger(
      user_id,kind,delta_bonus_available_fen,delta_debt_fen,
      available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
      bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
     ) values(
      ref.inviter_user_id,'referral_bonus',net_reward,-inviter_offset,
      inviter.available_fen,inviter.reserved_fen,inviter.refundable_fen,inviter.refund_hold_fen,
      inviter.bonus_available_fen,inviter.bonus_reserved_fen,inviter.adjustment_debt_fen,p_order_id::text,
      jsonb_build_object('referredUserId',o.user_id,'topupFen',amount_fen,'rate',0.10,'debtOffsetFen',inviter_offset)
     );
   end if;
 end if;
 return jsonb_build_object('ok',true,'grossFen',amount_fen,'creditedFen',net_credit,'debtOffsetFen',debt_offset);
end $$;

create or replace function public.request_ai_refund(p_user_id uuid,p_order_id uuid,p_amount_fen bigint,p_note text default null)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare v public.ai_wallets%rowtype; o public.orders%rowtype; topup_fen bigint; already_requested bigint; req_id uuid;
begin
 if p_amount_fen<=0 then return jsonb_build_object('ok',false,'error','INVALID_AMOUNT'); end if;
 select * into o from public.orders where id=p_order_id and user_id=p_user_id for update;
 if not found or o.status<>'paid' then return jsonb_build_object('ok',false,'error','ORDER_NOT_REFUNDABLE'); end if;
 select delta_available_fen into topup_fen from public.ai_wallet_ledger
 where user_id=p_user_id and kind='topup' and reference_id=p_order_id::text order by created_at asc limit 1;
 if topup_fen is null then return jsonb_build_object('ok',false,'error','NOT_AI_TOPUP'); end if;
 select coalesce(sum(amount_fen),0) into already_requested from public.ai_refund_requests
 where order_id=p_order_id and status in ('requested','approved','completed');
 if already_requested+p_amount_fen>topup_fen then return jsonb_build_object('ok',false,'error','ORDER_REFUND_LIMIT'); end if;

 select * into v from public.ai_wallets where user_id=p_user_id for update;
 if p_amount_fen>v.available_fen or p_amount_fen>v.refundable_fen then
   return jsonb_build_object('ok',false,'error','INSUFFICIENT_UNUSED_PRINCIPAL');
 end if;
 update public.ai_wallets set
   available_fen=available_fen-p_amount_fen,
   refund_hold_fen=refund_hold_fen+p_amount_fen,
   updated_at=now()
 where user_id=p_user_id returning * into v;
 insert into public.ai_refund_requests(user_id,order_id,amount_fen,note)
 values(p_user_id,p_order_id,p_amount_fen,left(coalesce(p_note,''),500))
 returning id into req_id;
 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_refund_hold_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
  bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
 ) values(
  p_user_id,'refund_hold',-p_amount_fen,p_amount_fen,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,
  v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,req_id::text,
  jsonb_build_object('orderId',p_order_id,'amountFen',p_amount_fen)
 );
 return jsonb_build_object('ok',true,'requestId',req_id);
end $$;

-- Refund completion/rejection and chargeback reversal are service-role only.
-- They are intentionally idempotent and claw back referral rewards.
create or replace function public.resolve_ai_refund(
 p_request_id uuid,p_resolution text,p_provider_refund_id text default null,p_note text default null
)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.ai_refund_requests%rowtype; v public.ai_wallets%rowtype; reward public.ai_referral_rewards%rowtype;
 reward_reverse bigint; available_bonus bigint; shortfall bigint;
begin
 if p_resolution not in ('approved','rejected','completed') then return jsonb_build_object('ok',false,'error','INVALID_RESOLUTION'); end if;
 select * into r from public.ai_refund_requests where id=p_request_id for update;
 if not found then return jsonb_build_object('ok',false,'error','REQUEST_NOT_FOUND'); end if;
 if r.status in ('completed','rejected') then return jsonb_build_object('ok',true,'alreadyFinal',true,'status',r.status); end if;

 if p_resolution='approved' then
   update public.ai_refund_requests set status='approved',provider_refund_id=coalesce(p_provider_refund_id,provider_refund_id),note=coalesce(nullif(p_note,''),note),updated_at=now() where id=p_request_id;
   return jsonb_build_object('ok',true,'status','approved');
 end if;

 select * into v from public.ai_wallets where user_id=r.user_id for update;
 if p_resolution='rejected' then
   update public.ai_wallets set available_fen=available_fen+r.amount_fen,refund_hold_fen=greatest(0,refund_hold_fen-r.amount_fen),updated_at=now()
   where user_id=r.user_id returning * into v;
   update public.ai_refund_requests set status='rejected',note=coalesce(nullif(p_note,''),note),updated_at=now() where id=p_request_id;
   insert into public.ai_wallet_ledger(
    user_id,kind,delta_available_fen,delta_refund_hold_fen,
    available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
    bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id
   ) values(
    r.user_id,'refund_release',r.amount_fen,-r.amount_fen,
    v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,
    v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,p_request_id::text
   );
   return jsonb_build_object('ok',true,'status','rejected');
 end if;

 update public.ai_wallets set
   refund_hold_fen=greatest(0,refund_hold_fen-r.amount_fen),
   refundable_fen=greatest(0,refundable_fen-r.amount_fen),
   updated_at=now()
 where user_id=r.user_id returning * into v;
 update public.ai_refund_requests set status='completed',provider_refund_id=coalesce(p_provider_refund_id,provider_refund_id),note=coalesce(nullif(p_note,''),note),updated_at=now() where id=p_request_id;
 insert into public.ai_wallet_ledger(
  user_id,kind,delta_refundable_fen,delta_refund_hold_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
  bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
 ) values(
  r.user_id,'refund_complete',-r.amount_fen,-r.amount_fen,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,
  v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,p_request_id::text,
  jsonb_build_object('orderId',r.order_id,'providerRefundId',p_provider_refund_id)
 );

 select * into reward from public.ai_referral_rewards where order_id=r.order_id for update;
 if found and reward.reversed_bonus_fen<reward.bonus_fen then
   reward_reverse:=least(reward.bonus_fen-reward.reversed_bonus_fen, floor(r.amount_fen*0.10));
   if reward_reverse>0 then
     insert into public.ai_wallets(user_id) values(reward.inviter_user_id) on conflict do nothing;
     select * into v from public.ai_wallets where user_id=reward.inviter_user_id for update;
     available_bonus:=least(v.bonus_available_fen,reward_reverse);
     shortfall:=reward_reverse-available_bonus;
     update public.ai_wallets set
       bonus_available_fen=bonus_available_fen-available_bonus,
       adjustment_debt_fen=adjustment_debt_fen+shortfall,
       updated_at=now()
     where user_id=reward.inviter_user_id returning * into v;
     update public.ai_referral_rewards set
       reversed_bonus_fen=reversed_bonus_fen+reward_reverse,
       status=case when reversed_bonus_fen+reward_reverse>=bonus_fen then 'reversed' else 'partially_reversed' end,
       reversed_at=now()
     where order_id=r.order_id;
     insert into public.ai_wallet_ledger(
      user_id,kind,delta_bonus_available_fen,delta_debt_fen,
      available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
      bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
     ) values(
      reward.inviter_user_id,'referral_reversal',-available_bonus,shortfall,
      v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,
      v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,r.order_id::text,
      jsonb_build_object('refundRequestId',p_request_id,'reverseFen',reward_reverse,'shortfallFen',shortfall)
     );
   end if;
 end if;
 return jsonb_build_object('ok',true,'status','completed');
end $$;

create or replace function public.reverse_ai_topup(p_order_id uuid,p_reason text)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
 o public.orders%rowtype; v public.ai_wallets%rowtype; topup_fen bigint; principal_take bigint; refundable_take bigint; shortfall bigint;
 reward public.ai_referral_rewards%rowtype; inviter public.ai_wallets%rowtype; bonus_take bigint; bonus_shortfall bigint;
begin
 if exists(select 1 from public.ai_topup_reversals where order_id=p_order_id) then return jsonb_build_object('ok',true,'alreadyReversed',true); end if;
 select * into o from public.orders where id=p_order_id for update;
 if not found then return jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); end if;
 select delta_available_fen into topup_fen from public.ai_wallet_ledger
 where user_id=o.user_id and kind='topup' and reference_id=p_order_id::text order by created_at asc limit 1;
 if topup_fen is null then return jsonb_build_object('ok',false,'error','NOT_AI_TOPUP'); end if;

 select * into v from public.ai_wallets where user_id=o.user_id for update;
 principal_take:=least(v.available_fen,topup_fen);
 refundable_take:=least(v.refundable_fen,topup_fen);
 shortfall:=topup_fen-principal_take;
 update public.ai_wallets set
   available_fen=available_fen-principal_take,
   refundable_fen=refundable_fen-refundable_take,
   adjustment_debt_fen=adjustment_debt_fen+shortfall,
   lifetime_topup_fen=greatest(0,lifetime_topup_fen-topup_fen),
   updated_at=now()
 where user_id=o.user_id returning * into v;
 insert into public.ai_topup_reversals(order_id,user_id,amount_fen,reason)
 values(p_order_id,o.user_id,topup_fen,left(coalesce(p_reason,'chargeback'),200));
 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_refundable_fen,delta_debt_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
  bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
 ) values(
  o.user_id,'topup_reversal',-principal_take,-refundable_take,shortfall,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,
  v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,p_order_id::text,
  jsonb_build_object('reason',p_reason,'grossFen',topup_fen,'shortfallFen',shortfall)
 );

 select * into reward from public.ai_referral_rewards where order_id=p_order_id for update;
 if found and reward.reversed_bonus_fen<reward.bonus_fen then
   insert into public.ai_wallets(user_id) values(reward.inviter_user_id) on conflict do nothing;
   select * into inviter from public.ai_wallets where user_id=reward.inviter_user_id for update;
   bonus_take:=least(inviter.bonus_available_fen,reward.bonus_fen-reward.reversed_bonus_fen);
   bonus_shortfall:=(reward.bonus_fen-reward.reversed_bonus_fen)-bonus_take;
   update public.ai_wallets set
     bonus_available_fen=bonus_available_fen-bonus_take,
     adjustment_debt_fen=adjustment_debt_fen+bonus_shortfall,
     updated_at=now()
   where user_id=reward.inviter_user_id returning * into inviter;
   update public.ai_referral_rewards set reversed_bonus_fen=bonus_fen,status='reversed',reversed_at=now() where order_id=p_order_id;
   insert into public.ai_wallet_ledger(
    user_id,kind,delta_bonus_available_fen,delta_debt_fen,
    available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
    bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
   ) values(
    reward.inviter_user_id,'referral_reversal',-bonus_take,bonus_shortfall,
    inviter.available_fen,inviter.reserved_fen,inviter.refundable_fen,inviter.refund_hold_fen,
    inviter.bonus_available_fen,inviter.bonus_reserved_fen,inviter.adjustment_debt_fen,p_order_id::text,
    jsonb_build_object('reason',p_reason,'shortfallFen',bonus_shortfall)
   );
 end if;
 update public.orders set status='refunded' where id=p_order_id;
 return jsonb_build_object('ok',true,'reversedFen',topup_fen,'debtFen',shortfall);
end $$;

revoke all on function public.ai_wallet_snapshot(uuid) from public,anon,authenticated;
revoke all on function public.reserve_ai_funds(uuid,uuid,text,text,bigint) from public,anon,authenticated;
revoke all on function public.credit_ai_topup(uuid) from public,anon,authenticated;
revoke all on function public.request_ai_refund(uuid,uuid,bigint,text) from public,anon,authenticated;
revoke all on function public.resolve_ai_refund(uuid,text,text,text) from public,anon,authenticated;
revoke all on function public.reverse_ai_topup(uuid,text) from public,anon,authenticated;

grant execute on function public.ai_wallet_snapshot(uuid) to service_role;
grant execute on function public.reserve_ai_funds(uuid,uuid,text,text,bigint) to service_role;
grant execute on function public.credit_ai_topup(uuid) to service_role;
grant execute on function public.request_ai_refund(uuid,uuid,bigint,text) to service_role;
grant execute on function public.resolve_ai_refund(uuid,text,text,text) to service_role;
grant execute on function public.reverse_ai_topup(uuid,text) to service_role;
