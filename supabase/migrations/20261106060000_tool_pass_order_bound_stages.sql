-- New-pass work must be bound to the EXACT purchased entitlement.
-- Each network-costing stage is authorized at most once per billed request.
-- Designed for isolated PostgreSQL CI first, not yet applied to production.
begin;
alter table public.lingxi_tool_use_events
 add column if not exists pass_id uuid references public.lingxi_tool_passes(id);
create index if not exists lingxi_tool_use_pass_id_idx
 on public.lingxi_tool_use_events(pass_id) where access_kind='pass';

create or replace function public.lingxi_capture_tool_pass_id()
 returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.access_kind='pass' then
  select p.id into new.pass_id from public.lingxi_tool_passes p
   where p.user_id=new.user_id and p.revoked_at is null
    and p.starts_at<=now() and p.expires_at>now()
   order by p.starts_at asc,p.created_at asc,p.id asc
   limit 1 for share;
  if new.pass_id is null then
   raise exception 'TOOL_PASS_ENTITLEMENT_NOT_FOUND' using errcode='P0001';
  end if;
 else
  new.pass_id:=null;
 end if;
 return new;
end $$;
revoke all on function public.lingxi_capture_tool_pass_id() from public,anon,authenticated;
drop trigger if exists lingxi_tool_use_bind_pass on public.lingxi_tool_use_events;
create trigger lingxi_tool_use_bind_pass
 before insert on public.lingxi_tool_use_events
 for each row execute function public.lingxi_capture_tool_pass_id();

-- Replacing only the already-reviewed revocation function, adding the exact
-- pass_id match; an unrelated active pass cannot revive refunded receipts.
create or replace function public.lingxi_redeem_tool_use(
 p_request_id uuid,p_user_id uuid,p_tool_slug text,p_operation_id uuid
)returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_use public.lingxi_tool_use_events%rowtype;
 v_receipt public.lingxi_tool_execution_receipts%rowtype;
 v_already boolean:=false;
begin
 if p_request_id is null or p_user_id is null or p_operation_id is null
 or p_tool_slug is null or p_tool_slug !~ '^[a-z0-9-]{1,96}$'
 then return jsonb_build_object('ok',false,'error','TOOL_USE_RECEIPT_REQUIRED');end if;
 select * into v_use from public.lingxi_tool_use_events
 where request_id=p_request_id for update;
 if not found or v_use.user_id<>p_user_id or v_use.tool_slug<>p_tool_slug
 or v_use.created_at<now()-interval '24 hours'
 then return jsonb_build_object('ok',false,'error','TOOL_USE_RECEIPT_INVALID');end if;
 -- A refunded or administratively revoked pass cannot fund new work.
 -- A naturally expired pass may finish a task started while it was valid.
 if v_use.access_kind='pass' and not exists(
   select 1 from public.lingxi_tool_passes p
    where p.id=v_use.pass_id and p.user_id=p_user_id
    and p.revoked_at is null and p.starts_at<=v_use.created_at
    and p.expires_at>v_use.created_at
 ) then return jsonb_build_object('ok',false,'error','PASS_REVOKED');end if;
 insert into public.lingxi_tool_execution_receipts(request_id,user_id,tool_slug,operation_id)
 values(p_request_id,p_user_id,p_tool_slug,p_operation_id)
 on conflict(request_id) do nothing returning * into v_receipt;
 if not found then
  v_already:=true;
  select * into v_receipt from public.lingxi_tool_execution_receipts
   where request_id=p_request_id;
 end if;
 if not found or v_receipt.user_id<>p_user_id or v_receipt.tool_slug<>p_tool_slug
  or v_receipt.operation_id<>p_operation_id
 then return jsonb_build_object('ok',false,'error','TOOL_USE_RECEIPT_ALREADY_USED');end if;
 return jsonb_build_object('ok',true,'alreadyRedeemed',v_already);
end $$;
revoke all on function public.lingxi_redeem_tool_use(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.lingxi_redeem_tool_use(uuid,uuid,text,uuid) to service_role;

create table if not exists public.lingxi_tool_execution_stages(
 request_id uuid not null references public.lingxi_tool_execution_receipts(request_id) on delete restrict,
 stage text not null check(stage ~ '^[a-z0-9-]{1,48}$'),
 user_id uuid not null references auth.users(id),
 operation_id uuid not null,
 redeemed_at timestamptz not null default now(),
 primary key(request_id,stage)
);
alter table public.lingxi_tool_execution_stages enable row level security;
revoke all on public.lingxi_tool_execution_stages from public,anon,authenticated;
grant all on public.lingxi_tool_execution_stages to service_role;

create or replace function public.lingxi_redeem_tool_stage(
 p_request_id uuid,p_user_id uuid,p_tool_slug text,p_operation_id uuid,p_stage text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_receipt jsonb;
 v_existing public.lingxi_tool_execution_stages%rowtype;
begin
 if p_stage is null or p_stage not in (
  'document-translate','document-ticket','document-normalize',
  'media-import','media-transcribe','media-translate','media-tts',
  'free-dubbing-preview','website-diagnose','mobile-file',
  'food-analysis','food-calculate','temp-mail-batch','burn-file-prepare','burn-file-complete'
 ) then return jsonb_build_object('ok',false,'error','INVALID_EXECUTION_STAGE');end if;
 v_receipt:=public.lingxi_redeem_tool_use(
   p_request_id,p_user_id,p_tool_slug,p_operation_id
 );
 if coalesce((v_receipt->>'ok')::boolean,false) is not true then return v_receipt;end if;
 insert into public.lingxi_tool_execution_stages(request_id,stage,user_id,operation_id)
 values(p_request_id,p_stage,p_user_id,p_operation_id)
 on conflict(request_id,stage) do nothing;
 if found then
  return jsonb_build_object('ok',true,'alreadyStarted',false,'stage',p_stage);
 end if;
 select * into v_existing from public.lingxi_tool_execution_stages
   where request_id=p_request_id and stage=p_stage;
 if not found or v_existing.user_id<>p_user_id or v_existing.operation_id<>p_operation_id then
  return jsonb_build_object('ok',false,'error','EXECUTION_STAGE_CONFLICT');
 end if;
 return jsonb_build_object('ok',true,'alreadyStarted',true,'stage',p_stage);
end $$;
revoke all on function public.lingxi_redeem_tool_stage(uuid,uuid,text,uuid,text)
 from public,anon,authenticated;
grant execute on function public.lingxi_redeem_tool_stage(uuid,uuid,text,uuid,text)
 to service_role;
commit;
