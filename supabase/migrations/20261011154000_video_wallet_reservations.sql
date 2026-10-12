begin;
alter table public.sasi_byok_video_tasks add column if not exists balance_reservation jsonb not null default '{}'::jsonb;

-- Internal helper: callers must already hold the owned task lock. Wallets are
-- always locked active then legacy, matching charge_sasi_usage_v49.
create or replace function public.adjust_video_reservation_v64(p_user_id uuid,p_currency text,p_active bigint,p_legacy bigint,p_release boolean,p_task_id uuid)
returns void language plpgsql set search_path=public,pg_temp as $$
declare idx integer; wallet text; avail_col text; reserved_col text; amount bigint; available bigint; reserved bigint; after_row jsonb; kind text; delta bigint;
begin
 if p_currency not in ('CNY','USD') or p_active<0 or p_legacy<0 or p_active is null or p_legacy is null then raise exception 'INVALID_RESERVATION';end if;
 kind:=case when p_release then 'release' else 'reserve' end;
 for idx in 1..2 loop
  amount:=case when idx=1 then p_active else p_legacy end;
  if amount=0 then continue;end if;
  wallet:=case when p_currency='CNY' then case when idx=1 then 'sasi_wallets' else 'ai_wallets' end else case when idx=1 then 'sasi_usd_wallets' else 'ai_usd_wallets' end end;
  avail_col:=case when p_currency='CNY' then case when idx=1 then 'available_points' else 'available_fen' end else 'available_cents' end;
  reserved_col:=case when p_currency='CNY' then case when idx=1 then 'reserved_points' else 'reserved_fen' end else 'reserved_cents' end;
  execute format('select %I,%I from public.%I where user_id=$1 for update',avail_col,reserved_col,wallet) into available,reserved using p_user_id;
  if available is null or reserved is null or (p_release and reserved<amount) or (not p_release and available<amount) then raise exception 'RESERVATION_BALANCE_INVALID';end if;
  delta:=case when p_release then amount else -amount end;
  execute format('update public.%I set %I=%I+$2,%I=%I-$2,updated_at=now() where user_id=$1 returning to_jsonb(%I.*)',wallet,avail_col,avail_col,reserved_col,reserved_col,wallet) into after_row using p_user_id,delta;
  if p_currency='CNY' and idx=1 then
   insert into public.sasi_credit_ledger(user_id,kind,delta_available,delta_reserved,available_after,reserved_after,reference_id,metadata)
   values(p_user_id,kind,delta,-delta,(after_row->>'available_points')::bigint,(after_row->>'reserved_points')::bigint,'video-reserve:'||p_task_id,jsonb_build_object('currency',p_currency,'videoTaskId',p_task_id));
  elsif p_currency='CNY' then
   insert into public.ai_wallet_ledger(user_id,kind,delta_available_fen,delta_reserved_fen,available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata)
   values(p_user_id,kind,delta,-delta,(after_row->>'available_fen')::bigint,(after_row->>'reserved_fen')::bigint,(after_row->>'refundable_fen')::bigint,(after_row->>'refund_hold_fen')::bigint,(after_row->>'bonus_available_fen')::bigint,(after_row->>'bonus_reserved_fen')::bigint,(after_row->>'adjustment_debt_fen')::bigint,'video-reserve:'||p_task_id,jsonb_build_object('currency',p_currency,'videoTaskId',p_task_id));
  elsif idx=1 then
   insert into public.sasi_usd_wallet_ledger(user_id,kind,delta_available_cents,delta_reserved_cents,available_after_cents,reserved_after_cents,reference_id,metadata)
   values(p_user_id,kind,delta,-delta,(after_row->>'available_cents')::bigint,(after_row->>'reserved_cents')::bigint,'video-reserve:'||p_task_id,jsonb_build_object('currency',p_currency,'videoTaskId',p_task_id));
  else
   insert into public.ai_usd_wallet_ledger(user_id,kind,delta_cents,available_after_cents,refundable_after_cents,refund_hold_after_cents,reserved_after_cents,reference_id,metadata)
   values(p_user_id,kind,delta,(after_row->>'available_cents')::bigint,(after_row->>'refundable_cents')::bigint,(after_row->>'refund_hold_cents')::bigint,(after_row->>'reserved_cents')::bigint,'video-reserve:'||p_task_id,jsonb_build_object('currency',p_currency,'videoTaskId',p_task_id,'deltaReservedMinor',-delta));
  end if;
 end loop;
end $$;
revoke all on function public.adjust_video_reservation_v64(uuid,text,bigint,bigint,boolean,uuid) from public,anon,authenticated,service_role;

create or replace function public.claim_sasi_byok_video_v64(p_user_id uuid,p_task_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.sasi_byok_video_tasks%rowtype; currency text; amount bigint; active bigint; legacy bigint; active_take bigint;
begin
 select * into t from public.sasi_byok_video_tasks where id=p_task_id and user_id=p_user_id for update;
 if t.id is null then return jsonb_build_object('ok',false,'error','TASK_NOT_FOUND');end if;
 if t.state<>'quoted' then return jsonb_build_object('ok',true,'claimed',false,'state',t.state);end if;
 if t.expires_at<=now() then return jsonb_build_object('ok',false,'error','REQUOTE_REQUIRED');end if;
 currency:=case when t.request->>'billingCurrency'='USD' then 'USD' else 'CNY' end;
 amount:=coalesce((t.request->>'platformChargeMinor')::bigint,t.estimated_fen);
 if amount<=0 or amount<>t.estimated_fen then return jsonb_build_object('ok',false,'error','QUOTE_INVALID');end if;
 if currency='CNY' then
  insert into public.sasi_wallets(user_id) values(p_user_id) on conflict do nothing;
  select available_points into active from public.sasi_wallets where user_id=p_user_id for update;
  select available_fen into legacy from public.ai_wallets where user_id=p_user_id for update;
 else
  insert into public.sasi_usd_wallets(user_id) values(p_user_id) on conflict do nothing;
  select available_cents into active from public.sasi_usd_wallets where user_id=p_user_id for update;
  select available_cents into legacy from public.ai_usd_wallets where user_id=p_user_id for update;
 end if;
 legacy:=coalesce(legacy,0);
 if active+legacy<amount then return jsonb_build_object('ok',false,'error','SASI_BALANCE_INSUFFICIENT');end if;
 active_take:=least(active,amount);
 perform public.adjust_video_reservation_v64(p_user_id,currency,active_take,amount-active_take,false,t.id);
 update public.sasi_byok_video_tasks set state='submitting',approved_at=now(),updated_at=now(),balance_reservation=jsonb_build_object('state','held','currency',currency,'activeMinor',active_take,'legacyMinor',amount-active_take) where id=t.id;
 return jsonb_build_object('ok',true,'claimed',true,'state','submitting','reservedMinor',amount);
end $$;
revoke all on function public.claim_sasi_byok_video_v64(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_sasi_byok_video_v64(uuid,uuid) to service_role;

commit;
