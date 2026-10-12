begin;
alter table public.sasi_byok_video_tasks add column if not exists balance_reservation jsonb not null default '{}'::jsonb;

-- Lock the existing owned task, then use the existing unified charge RPC.
-- A task save failure rolls back the charge and all source-wallet ledgers.
create or replace function public.complete_sasi_byok_video_v64(p_user_id uuid,p_task_id uuid,p_provider_task_id text,p_state text,p_output jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.sasi_byok_video_tasks%rowtype; bill jsonb; amount bigint; currency text;
begin
 select * into t from public.sasi_byok_video_tasks where id=p_task_id and user_id=p_user_id for update;
 if t.id is null then return jsonb_build_object('ok',false,'error','TASK_NOT_FOUND');end if;
 if t.provider_task_id is null or t.provider_task_id is distinct from p_provider_task_id then return jsonb_build_object('ok',false,'error','PROVIDER_TASK_MISMATCH');end if;
 if t.state in ('succeeded','failed') then return jsonb_build_object('ok',true,'state',t.state,'alreadyCompleted',true);end if;
 if t.state not in ('queued','running') or p_state not in ('succeeded','failed') then return jsonb_build_object('ok',false,'error','TASK_STATE_INVALID');end if;
 if p_output is null or jsonb_typeof(p_output)<>'object' or octet_length(p_output::text)>65536 then return jsonb_build_object('ok',false,'error','RESULT_INVALID');end if;
 currency:=case when t.request->>'billingCurrency'='USD' then 'USD' else 'CNY' end;
 amount:=coalesce((t.request->>'platformChargeMinor')::bigint,t.estimated_fen);
 if amount<=0 or amount<>t.estimated_fen then return jsonb_build_object('ok',false,'error','QUOTE_INVALID');end if;
 if t.balance_reservation->>'state'='held' then
  if t.balance_reservation->>'currency'<>currency or coalesce((t.balance_reservation->>'activeMinor')::bigint,0)+coalesce((t.balance_reservation->>'legacyMinor')::bigint,0)<>amount then raise exception 'VIDEO_RESERVATION_CONFLICT';end if;
  perform public.adjust_video_reservation_v64(p_user_id,currency,(t.balance_reservation->>'activeMinor')::bigint,(t.balance_reservation->>'legacyMinor')::bigint,true,t.id);
 end if;
 if p_state='succeeded' then
  if coalesce(p_output->>'videoUrl','') !~ '^https://[^[:space:]]+$' then return jsonb_build_object('ok',false,'error','RESULT_INVALID');end if;
  bill:=public.charge_sasi_usage_v49(p_user_id,currency,amount,'video:'||t.id::text,'video',jsonb_build_object('duration',t.request->'duration','resolution',t.request->'resolution','provider',t.provider));
  if coalesce((bill->>'ok')::boolean,false)=false then raise exception 'VIDEO_CHARGE_REJECTED: %',bill->>'error';end if;
 end if;
 update public.sasi_byok_video_tasks set state=p_state,
 output=p_output||case when p_state='succeeded' then jsonb_build_object('billing',jsonb_build_object('currency',currency,'chargedMinor',amount,'pricingVersion','2026-10-02-v49')) else '{}'::jsonb end,
 balance_reservation=case when t.balance_reservation->>'state'='held' then jsonb_set(t.balance_reservation,'{state}',to_jsonb(case when p_state='succeeded' then 'settled'::text else 'released'::text end)) else t.balance_reservation end,
 updated_at=now() where id=t.id;
 return jsonb_build_object('ok',true,'state',p_state,'billing',bill);
end $$;
revoke all on function public.complete_sasi_byok_video_v64(uuid,uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.complete_sasi_byok_video_v64(uuid,uuid,text,text,jsonb) to service_role;

commit;
