begin;
alter table public.ai_wallet_ledger drop constraint ai_wallet_ledger_kind_check;
alter table public.ai_wallet_ledger add constraint ai_wallet_ledger_kind_check check(kind in ('topup','reserve','settle','release','referral_bonus','refund_hold','refund_release','refund_complete','topup_reversal','referral_reversal','debt_offset','withdrawal_hold','withdrawal_release','withdrawal_complete','usage_v49'));
create or replace function public.charge_sasi_usage_v49(p_user_id uuid,p_currency text,p_amount_minor bigint,p_reference_id text,p_kind text,p_metadata jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 c text:=upper(p_currency); active_minor bigint; legacy_minor bigint; active_take bigint; legacy_take bigint; refundable_take bigint; previous bigint; meta jsonb;
 w public.sasi_wallets%rowtype; a public.ai_wallets%rowtype; u public.sasi_usd_wallets%rowtype; d public.ai_usd_wallets%rowtype;
begin
 if p_user_id is null or p_amount_minor is null or p_amount_minor<=0 or coalesce(length(p_reference_id),0)<3 then return jsonb_build_object('ok',false,'error','INVALID_USAGE_CHARGE');end if;
 if c is null or c not in ('CNY','USD') then return jsonb_build_object('ok',false,'error','UNSUPPORTED_CURRENCY');end if;
 -- Preserve each source ledger and refundable principal. Never transfer or duplicate a top-up.
 -- Always lock active then legacy. Recheck the reference after locking to serialize repeat requests.
 if c='CNY' then
  insert into public.sasi_wallets(user_id) values(p_user_id) on conflict do nothing;
  select * into w from public.sasi_wallets where user_id=p_user_id for update;
  select * into a from public.ai_wallets where user_id=p_user_id for update;
  active_minor:=w.available_points;legacy_minor:=coalesce(a.available_fen,0);
  select coalesce((select sum(-delta_available) from public.sasi_credit_ledger where user_id=p_user_id and kind='usage_v49' and reference_id=p_reference_id),0)+coalesce((select sum(-delta_available_fen) from public.ai_wallet_ledger where user_id=p_user_id and kind='usage_v49' and reference_id=p_reference_id),0) into previous;
 else
  insert into public.sasi_usd_wallets(user_id) values(p_user_id) on conflict do nothing;
  select * into u from public.sasi_usd_wallets where user_id=p_user_id for update;
  select * into d from public.ai_usd_wallets where user_id=p_user_id for update;
  active_minor:=u.available_cents;legacy_minor:=coalesce(d.available_cents,0);
  select coalesce((select sum(-delta_available_cents) from public.sasi_usd_wallet_ledger where user_id=p_user_id and kind='usage_v49' and reference_id=p_reference_id),0)+coalesce((select sum(-delta_cents) from public.ai_usd_wallet_ledger where user_id=p_user_id and kind='usage_v49' and reference_id=p_reference_id),0) into previous;
 end if;
 if previous>0 then
  if previous<>p_amount_minor then return jsonb_build_object('ok',false,'error','CHARGE_REFERENCE_CONFLICT');end if;
  return jsonb_build_object('ok',true,'alreadyCharged',true,'chargedMinor',previous,'availableMinor',active_minor+legacy_minor);
 end if;
 if active_minor+legacy_minor<p_amount_minor then return jsonb_build_object('ok',false,'error','SASI_BALANCE_INSUFFICIENT','availableMinor',active_minor+legacy_minor,'requiredMinor',p_amount_minor);end if;
 active_take:=least(active_minor,p_amount_minor);legacy_take:=p_amount_minor-active_take;
 meta:=coalesce(p_metadata,'{}'::jsonb)||jsonb_build_object('usageKind',left(coalesce(p_kind,'sasi'),80),'pricingVersion','2026-10-06-unified-balance','totalChargedMinor',p_amount_minor);
 if c='CNY' then
  if active_take>0 then
   update public.sasi_wallets set available_points=available_points-active_take,refundable_points=greatest(0,refundable_points-active_take),updated_at=now() where user_id=p_user_id returning * into w;
   insert into public.sasi_credit_ledger(user_id,kind,delta_available,delta_reserved,available_after,reserved_after,reference_id,metadata) values(p_user_id,'usage_v49',-active_take,0,w.available_points,w.reserved_points,p_reference_id,meta);
  end if;
  if legacy_take>0 then
   refundable_take:=least(a.refundable_fen,legacy_take);
   update public.ai_wallets set available_fen=available_fen-legacy_take,refundable_fen=refundable_fen-refundable_take,updated_at=now() where user_id=p_user_id returning * into a;
   insert into public.ai_wallet_ledger(user_id,kind,delta_available_fen,delta_refundable_fen,available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata) values(p_user_id,'usage_v49',-legacy_take,-refundable_take,a.available_fen,a.reserved_fen,a.refundable_fen,a.refund_hold_fen,a.bonus_available_fen,a.bonus_reserved_fen,a.adjustment_debt_fen,p_reference_id,meta);
  end if;
 else
  if active_take>0 then
   update public.sasi_usd_wallets set available_cents=available_cents-active_take,refundable_cents=greatest(0,refundable_cents-active_take),updated_at=now() where user_id=p_user_id returning * into u;
   insert into public.sasi_usd_wallet_ledger(user_id,kind,delta_available_cents,delta_reserved_cents,available_after_cents,reserved_after_cents,reference_id,metadata) values(p_user_id,'usage_v49',-active_take,0,u.available_cents,u.reserved_cents,p_reference_id,meta);
  end if;
  if legacy_take>0 then
   refundable_take:=least(d.refundable_cents,legacy_take);
   update public.ai_usd_wallets set available_cents=available_cents-legacy_take,refundable_cents=refundable_cents-refundable_take,updated_at=now() where user_id=p_user_id returning * into d;
   insert into public.ai_usd_wallet_ledger(user_id,kind,delta_cents,delta_refundable_cents,available_after_cents,refundable_after_cents,refund_hold_after_cents,reserved_after_cents,reference_id,metadata) values(p_user_id,'usage_v49',-legacy_take,-refundable_take,d.available_cents,d.refundable_cents,d.refund_hold_cents,d.reserved_cents,p_reference_id,meta);
  end if;
 end if;
 return jsonb_build_object('ok',true,'alreadyCharged',false,'chargedMinor',p_amount_minor,'activeChargedMinor',active_take,'legacyChargedMinor',legacy_take,'availableMinor',active_minor+legacy_minor-p_amount_minor);
end $$;
revoke all on function public.charge_sasi_usage_v49(uuid,text,bigint,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.charge_sasi_usage_v49(uuid,text,bigint,text,text,jsonb) to service_role;
commit;
