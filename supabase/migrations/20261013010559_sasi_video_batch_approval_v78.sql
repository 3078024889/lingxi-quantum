begin;
create table public.sasi_video_batch_approvals_v78(
 batch_id uuid primary key,user_id uuid not null,project_id uuid not null,
 currency text not null check(currency in('CNY','USD')),amount_minor bigint not null check(amount_minor>0),
 task_ids uuid[] not null,approved_at timestamptz not null default now()
);
alter table public.sasi_video_batch_approvals_v78 enable row level security;
revoke all on public.sasi_video_batch_approvals_v78 from public,anon,authenticated;
grant all on public.sasi_video_batch_approvals_v78 to service_role;

create function public.approve_sasi_video_batch_v78(p_user_id uuid,p_batch_id uuid,p_expected_total bigint,p_currency text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.sasi_byok_video_tasks%rowtype; a public.sasi_video_batch_approvals_v78%rowtype; ids uuid[]:='{}'; total bigint:=0; active bigint; legacy bigint; take_active bigint; pid uuid; n integer:=0;
begin
 if p_user_id is null or p_batch_id is null or p_expected_total is null or p_expected_total<=0 or p_currency is null or p_currency not in('CNY','USD') then return jsonb_build_object('ok',false,'error','QUOTE_INVALID');end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text||':'||p_batch_id::text,78));
 select * into a from public.sasi_video_batch_approvals_v78 where batch_id=p_batch_id;
 if a.batch_id is not null then
  if a.user_id<>p_user_id or a.currency<>p_currency or a.amount_minor<>p_expected_total then return jsonb_build_object('ok',false,'error','QUOTE_INVALID');end if;
  return jsonb_build_object('ok',true,'taskIds',to_jsonb(a.task_ids),'replayed',true);
 end if;
 for t in select * from public.sasi_byok_video_tasks where user_id=p_user_id and request->>'batchId'=p_batch_id::text order by id for update loop
  n:=n+1;pid:=coalesce(pid,t.project_id);
  if n>500 or t.project_id is distinct from pid or t.state<>'quoted' or t.expires_at<=now() or t.estimated_fen<=0 or coalesce((t.request->>'platformChargeMinor')::bigint,0)<>t.estimated_fen or t.request->>'billingCurrency' is distinct from p_currency or t.balance_reservation->>'state'='held' then return jsonb_build_object('ok',false,'error','REQUOTE_REQUIRED');end if;
  ids:=array_append(ids,t.id);total:=total+t.estimated_fen;
 end loop;
 if n=0 or total<>p_expected_total then return jsonb_build_object('ok',false,'error','QUOTE_INVALID');end if;
 if p_currency='CNY' then
  insert into public.sasi_wallets(user_id) values(p_user_id) on conflict do nothing;
  select available_points into active from public.sasi_wallets where user_id=p_user_id for update;
  select available_fen into legacy from public.ai_wallets where user_id=p_user_id for update;
 else
  insert into public.sasi_usd_wallets(user_id) values(p_user_id) on conflict do nothing;
  select available_cents into active from public.sasi_usd_wallets where user_id=p_user_id for update;
  select available_cents into legacy from public.ai_usd_wallets where user_id=p_user_id for update;
 end if;
 legacy:=coalesce(legacy,0);if coalesce(active,0)+legacy<total then return jsonb_build_object('ok',false,'error','SASI_BALANCE_INSUFFICIENT');end if;
 for t in select * from public.sasi_byok_video_tasks where id=any(ids) order by id loop
  take_active:=least(active,t.estimated_fen);active:=active-take_active;
  perform public.adjust_video_reservation_v64(p_user_id,p_currency,take_active,t.estimated_fen-take_active,false,t.id);
  update public.sasi_byok_video_tasks set approved_at=now(),expires_at=now()+interval '72 hours',updated_at=now(),balance_reservation=jsonb_build_object('state','held','currency',p_currency,'activeMinor',take_active,'legacyMinor',t.estimated_fen-take_active) where id=t.id;
 end loop;
 insert into public.sasi_video_batch_approvals_v78(batch_id,user_id,project_id,currency,amount_minor,task_ids) values(p_batch_id,p_user_id,pid,p_currency,total,ids);
 return jsonb_build_object('ok',true,'taskIds',to_jsonb(ids),'amountMinor',total);
end $$;
revoke all on function public.approve_sasi_video_batch_v78(uuid,uuid,bigint,text) from public,anon,authenticated;
grant execute on function public.approve_sasi_video_batch_v78(uuid,uuid,bigint,text) to service_role;

alter function public.claim_sasi_byok_video_v64(uuid,uuid) rename to claim_sasi_byok_video_unreserved_v64;
revoke all on function public.claim_sasi_byok_video_unreserved_v64(uuid,uuid) from public,anon,authenticated,service_role;
create function public.claim_sasi_byok_video_v64(p_user_id uuid,p_task_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.sasi_byok_video_tasks%rowtype; amount bigint; currency text;
begin
 select * into t from public.sasi_byok_video_tasks where id=p_task_id and user_id=p_user_id for update;
 if t.id is null then return jsonb_build_object('ok',false,'error','TASK_NOT_FOUND');end if;
 if t.state<>'quoted' then return jsonb_build_object('ok',true,'claimed',false,'state',t.state);end if;
 if t.balance_reservation->>'state' is distinct from 'held' then return public.claim_sasi_byok_video_unreserved_v64(p_user_id,p_task_id);end if;
 amount:=t.estimated_fen;currency:=t.request->>'billingCurrency';
 if t.approved_at is null or t.expires_at<=now() or t.balance_reservation->>'currency'<>currency or coalesce((t.balance_reservation->>'activeMinor')::bigint,0)+coalesce((t.balance_reservation->>'legacyMinor')::bigint,0)<>amount then return jsonb_build_object('ok',false,'error','QUOTE_INVALID');end if;
 update public.sasi_byok_video_tasks set state='submitting',updated_at=now() where id=t.id;
 return jsonb_build_object('ok',true,'claimed',true,'state','submitting','reservedMinor',amount);
end $$;
revoke all on function public.claim_sasi_byok_video_v64(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_sasi_byok_video_v64(uuid,uuid) to service_role;
create function public.fail_quoted_sasi_video_v78(p_user_id uuid,p_task_id uuid,p_error text)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.sasi_byok_video_tasks%rowtype;
begin
 select * into t from public.sasi_byok_video_tasks where user_id=p_user_id and id=p_task_id for update;
 if t.id is null or t.state<>'quoted' then return false;end if;
 if t.balance_reservation->>'state'='held' then
  perform public.adjust_video_reservation_v64(p_user_id,t.balance_reservation->>'currency',(t.balance_reservation->>'activeMinor')::bigint,(t.balance_reservation->>'legacyMinor')::bigint,true,t.id);
 end if;
 update public.sasi_byok_video_tasks set state='failed',output=jsonb_build_object('deliveryError',left(p_error,120)),balance_reservation=jsonb_set(balance_reservation,'{state}','"released"'::jsonb),updated_at=now() where id=t.id;
 return true;
end $$;
revoke all on function public.fail_quoted_sasi_video_v78(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.fail_quoted_sasi_video_v78(uuid,uuid,text) to service_role;
commit;
