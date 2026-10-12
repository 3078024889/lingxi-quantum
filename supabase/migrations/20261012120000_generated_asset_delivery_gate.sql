begin;
create table if not exists public.sasi_generated_assets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 project_id uuid references public.sasi_projects(id) on delete set null,
 source_task_id uuid not null,
 kind text not null check(kind in ('image','video')),
 storage_provider text not null check(storage_provider in ('r2','supabase')),
 bucket text not null,
 object_key text not null unique,
 sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 byte_size bigint not null check(byte_size between 1 and 104857600),
 mime_type text not null,
 width integer not null check(width between 1 and 8192),
 height integer not null check(height between 1 and 8192),
 duration_seconds double precision,
 verification text not null check(verification='decoded-and-readback'),
 status text not null check(status='ready'),
 created_at timestamptz not null default now(),
 unique(user_id,source_task_id,kind),
 check(object_key like 'sasi/'||user_id::text||'/%'),
 check((kind='image' and duration_seconds is null and byte_size<=20971520 and width::bigint*height<=24000000 and mime_type in ('image/png','image/jpeg','image/webp')) or (kind='video' and duration_seconds is not null and duration_seconds>0 and duration_seconds<=120 and mime_type='video/mp4'))
);
alter table public.sasi_generated_assets enable row level security;
revoke all on public.sasi_generated_assets from public,anon,authenticated;
grant select on public.sasi_generated_assets to authenticated;
grant all on public.sasi_generated_assets to service_role;
create policy generated_asset_owner_read on public.sasi_generated_assets for select to authenticated using((select auth.uid())=user_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('sasi-generated','sasi-generated',false,104857600,array['image/png','image/jpeg','image/webp','video/mp4']) on conflict(id) do nothing;
-- No client write policy: generated objects are written only by the service role.
alter table public.sasi_byok_image_tasks add column if not exists balance_reservation jsonb not null default '{}'::jsonb;

create or replace function public.adjust_generated_reservation_v77(p_user_id uuid,p_currency text,p_active bigint,p_legacy bigint,p_release boolean,p_task_id uuid,p_media_kind text)
returns void language plpgsql set search_path=public,pg_temp as $$
declare idx integer; wallet text; avail_col text; reserved_col text; amount bigint; available bigint; reserved bigint; after_row jsonb; kind text; delta bigint;
begin
 if p_media_kind not in ('image','video') then raise exception 'INVALID_MEDIA_KIND';end if;
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
   values(p_user_id,kind,delta,-delta,(after_row->>'available_points')::bigint,(after_row->>'reserved_points')::bigint,p_media_kind||'-reserve:'||p_task_id,jsonb_build_object('currency',p_currency,p_media_kind||'TaskId',p_task_id));
  elsif p_currency='CNY' then
   insert into public.ai_wallet_ledger(user_id,kind,delta_available_fen,delta_reserved_fen,available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata)
   values(p_user_id,kind,delta,-delta,(after_row->>'available_fen')::bigint,(after_row->>'reserved_fen')::bigint,(after_row->>'refundable_fen')::bigint,(after_row->>'refund_hold_fen')::bigint,(after_row->>'bonus_available_fen')::bigint,(after_row->>'bonus_reserved_fen')::bigint,(after_row->>'adjustment_debt_fen')::bigint,p_media_kind||'-reserve:'||p_task_id,jsonb_build_object('currency',p_currency,p_media_kind||'TaskId',p_task_id));
  elsif idx=1 then
   insert into public.sasi_usd_wallet_ledger(user_id,kind,delta_available_cents,delta_reserved_cents,available_after_cents,reserved_after_cents,reference_id,metadata)
   values(p_user_id,kind,delta,-delta,(after_row->>'available_cents')::bigint,(after_row->>'reserved_cents')::bigint,p_media_kind||'-reserve:'||p_task_id,jsonb_build_object('currency',p_currency,p_media_kind||'TaskId',p_task_id));
  else
   insert into public.ai_usd_wallet_ledger(user_id,kind,delta_cents,available_after_cents,refundable_after_cents,refund_hold_after_cents,reserved_after_cents,reference_id,metadata)
   values(p_user_id,kind,delta,(after_row->>'available_cents')::bigint,(after_row->>'refundable_cents')::bigint,(after_row->>'refund_hold_cents')::bigint,(after_row->>'reserved_cents')::bigint,p_media_kind||'-reserve:'||p_task_id,jsonb_build_object('currency',p_currency,p_media_kind||'TaskId',p_task_id,'deltaReservedMinor',-delta));
  end if;
 end loop;
end $$;
revoke all on function public.adjust_generated_reservation_v77(uuid,text,bigint,bigint,boolean,uuid,text) from public,anon,authenticated,service_role;

create or replace function public.adjust_video_reservation_v64(p_user_id uuid,p_currency text,p_active bigint,p_legacy bigint,p_release boolean,p_task_id uuid)
returns void language sql set search_path=public,pg_temp as $$select public.adjust_generated_reservation_v77(p_user_id,p_currency,p_active,p_legacy,p_release,p_task_id,'video')$$;
revoke all on function public.adjust_video_reservation_v64(uuid,text,bigint,bigint,boolean,uuid) from public,anon,authenticated;
create or replace function public.claim_sasi_byok_image_v77(p_user_id uuid,p_task_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.sasi_byok_image_tasks%rowtype; currency text; amount bigint; active bigint; legacy bigint; active_take bigint;
begin
 select * into t from public.sasi_byok_image_tasks where id=p_task_id and user_id=p_user_id for update;
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
 perform public.adjust_generated_reservation_v77(p_user_id,currency,active_take,amount-active_take,false,t.id,'image');
 update public.sasi_byok_image_tasks set state='running',updated_at=now(),balance_reservation=jsonb_build_object('state','held','currency',currency,'activeMinor',active_take,'legacyMinor',amount-active_take) where id=t.id;
 return jsonb_build_object('ok',true,'claimed',true,'state','running','reservedMinor',amount);
end $$;
revoke all on function public.claim_sasi_byok_image_v77(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_sasi_byok_image_v77(uuid,uuid) to service_role;

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
 if p_state='succeeded' then
  if coalesce(p_output->>'assetId','') !~ '^[a-f0-9-]{36}$' then return jsonb_build_object('ok',false,'error','ASSET_REQUIRED');end if;
  if not exists(select 1 from public.sasi_generated_assets where id=(p_output->>'assetId')::uuid and user_id=p_user_id and source_task_id=t.id and kind='video' and status='ready' and verification='decoded-and-readback') then return jsonb_build_object('ok',false,'error','ASSET_REQUIRED');end if;
 end if;
 currency:=case when t.request->>'billingCurrency'='USD' then 'USD' else 'CNY' end;
 amount:=coalesce((t.request->>'platformChargeMinor')::bigint,t.estimated_fen);
 if amount<=0 or amount<>t.estimated_fen then return jsonb_build_object('ok',false,'error','QUOTE_INVALID');end if;
 if t.balance_reservation->>'state'='held' then
  if t.balance_reservation->>'currency'<>currency or coalesce((t.balance_reservation->>'activeMinor')::bigint,0)+coalesce((t.balance_reservation->>'legacyMinor')::bigint,0)<>amount then raise exception 'VIDEO_RESERVATION_CONFLICT';end if;
  perform public.adjust_video_reservation_v64(p_user_id,currency,(t.balance_reservation->>'activeMinor')::bigint,(t.balance_reservation->>'legacyMinor')::bigint,true,t.id);
 end if;
 if p_state='succeeded' then
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


create or replace function public.complete_sasi_byok_image_v77(p_user_id uuid,p_task_id uuid,p_output jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.sasi_byok_image_tasks%rowtype; bill jsonb; amount bigint; currency text;
begin
 select * into t from public.sasi_byok_image_tasks where id=p_task_id and user_id=p_user_id for update;
 if t.id is null then return jsonb_build_object('ok',false,'error','TASK_NOT_FOUND');end if;
 if t.state='succeeded' then return jsonb_build_object('ok',true,'state',t.state,'alreadyCompleted',true,'output',t.output);end if;
 if t.state not in ('running','uncertain') then return jsonb_build_object('ok',false,'error','TASK_STATE_INVALID');end if;
 if p_output is null or jsonb_typeof(p_output)<>'object' or octet_length(p_output::text)>65536 or coalesce(p_output->>'assetId','') !~ '^[a-f0-9-]{36}$' then return jsonb_build_object('ok',false,'error','ASSET_REQUIRED');end if;
 if not exists(select 1 from public.sasi_generated_assets where id=(p_output->>'assetId')::uuid and user_id=p_user_id and source_task_id=t.id and kind='image' and status='ready' and verification='decoded-and-readback') then return jsonb_build_object('ok',false,'error','ASSET_REQUIRED');end if;
 currency:=case when t.request->>'billingCurrency'='USD' then 'USD' else 'CNY' end;
 amount:=coalesce((t.request->>'platformChargeMinor')::bigint,t.estimated_fen);
 if amount<=0 or amount<>t.estimated_fen then return jsonb_build_object('ok',false,'error','QUOTE_INVALID');end if;
 if t.balance_reservation->>'state'='held' then
  if t.balance_reservation->>'currency'<>currency or coalesce((t.balance_reservation->>'activeMinor')::bigint,0)+coalesce((t.balance_reservation->>'legacyMinor')::bigint,0)<>amount then raise exception 'IMAGE_RESERVATION_CONFLICT';end if;
  perform public.adjust_generated_reservation_v77(p_user_id,currency,(t.balance_reservation->>'activeMinor')::bigint,(t.balance_reservation->>'legacyMinor')::bigint,true,t.id,'image');
 end if;
 bill:=public.charge_sasi_usage_v49(p_user_id,currency,amount,'image:'||t.id::text,'image',jsonb_build_object('assetId',p_output->>'assetId','size',t.request->>'size'));
 if coalesce((bill->>'ok')::boolean,false)=false then raise exception 'IMAGE_CHARGE_REJECTED: %',bill->>'error';end if;
 update public.sasi_byok_image_tasks set state='succeeded',output=p_output||jsonb_build_object('billing',jsonb_build_object('currency',currency,'chargedMinor',amount,'pricingVersion','2026-10-02-v49')),
 balance_reservation=case when t.balance_reservation->>'state'='held' then jsonb_set(t.balance_reservation,'{state}','"settled"'::jsonb) else t.balance_reservation end,updated_at=now() where id=t.id;
 return jsonb_build_object('ok',true,'state','succeeded','billing',bill,'output',p_output);
end $$;
revoke all on function public.complete_sasi_byok_image_v77(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.complete_sasi_byok_image_v77(uuid,uuid,jsonb) to service_role;
create or replace function public.fail_sasi_byok_image_v77(p_user_id uuid,p_task_id uuid,p_error text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.sasi_byok_image_tasks%rowtype;
begin
 select * into t from public.sasi_byok_image_tasks where id=p_task_id and user_id=p_user_id for update;
 if t.id is null then return jsonb_build_object('ok',false,'error','TASK_NOT_FOUND');end if;
 if t.state in ('succeeded','failed') then return jsonb_build_object('ok',true,'state',t.state);end if;
 if exists(select 1 from public.sasi_generated_assets where user_id=p_user_id and source_task_id=t.id and kind='image' and status='ready') then return jsonb_build_object('ok',false,'error','ASSET_ALREADY_READY');end if;
 if t.balance_reservation->>'state'='held' then
  perform public.adjust_generated_reservation_v77(p_user_id,t.balance_reservation->>'currency',(t.balance_reservation->>'activeMinor')::bigint,(t.balance_reservation->>'legacyMinor')::bigint,true,t.id,'image');
 end if;
 update public.sasi_byok_image_tasks set state='failed',output=output||jsonb_build_object('deliveryError',left(p_error,120)),balance_reservation=jsonb_set(balance_reservation,'{state}','"released"'::jsonb),updated_at=now() where id=t.id;
 return jsonb_build_object('ok',true,'state','failed');
end $$;
revoke all on function public.fail_sasi_byok_image_v77(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.fail_sasi_byok_image_v77(uuid,uuid,text) to service_role;
commit;
