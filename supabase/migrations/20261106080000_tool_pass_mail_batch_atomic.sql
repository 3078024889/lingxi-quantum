-- Atomic batch-mail delivery under the unified, explicitly ENABLED tool pass.
-- Applied in disposable PostgreSQL 17 only until live acceptance completes.
begin;
create table if not exists public.lingxi_tool_pass_mail_batches(
 request_id uuid primary key references public.lingxi_tool_use_events(request_id) on delete restrict,
 user_id uuid not null references auth.users(id),
 operation_id uuid not null,
 mailbox_count integer not null check(mailbox_count between 11 and 100),
 created_at timestamptz not null default now()
);
alter table public.lingxi_tool_pass_mail_batches enable row level security;
revoke all on public.lingxi_tool_pass_mail_batches from public,anon,authenticated;
grant all on public.lingxi_tool_pass_mail_batches to service_role;

alter table public.temp_mailboxes
 add column if not exists token_hash text,
 add column if not exists source_kind text not null default 'single',
 add column if not exists created_at timestamptz not null default now(),
 add column if not exists pass_request_id uuid references public.lingxi_tool_pass_mail_batches(request_id);
create unique index if not exists lingxi_pass_mail_part_unique on public.temp_mailboxes(local_part);
create index if not exists lingxi_pass_mail_request on public.temp_mailboxes(pass_request_id)
 where pass_request_id is not null;

create or replace function public.lingxi_create_pass_mail_batch(
 p_request_id uuid,p_user_id uuid,p_operation_id uuid,p_count integer,p_entries jsonb
)returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_source public.lingxi_tool_use_events%rowtype;
 v_prev public.lingxi_tool_pass_mail_batches%rowtype;
 v_stage jsonb;
 v_today_count bigint;
 v_rows jsonb;
 v_count integer;
begin
 if p_request_id is null or p_user_id is null or p_operation_id is null
  or p_count is null or p_count<11 or p_count>100
  or jsonb_typeof(p_entries) is distinct from 'array'
  or jsonb_array_length(p_entries)<>p_count
 then return jsonb_build_object('ok',false,'error','PASS_MAIL_INPUT_INVALID');end if;
 -- Same-user batch operations serialize for count quotas and idempotency.
 perform pg_advisory_xact_lock(hashtextextended('lingxi-pass-mail:'||p_user_id::text,0));
 select * into v_prev from public.lingxi_tool_pass_mail_batches where request_id=p_request_id for update;
 if found then
  if v_prev.user_id<>p_user_id or v_prev.operation_id<>p_operation_id
   or v_prev.mailbox_count<>p_count
  then return jsonb_build_object('ok',false,'error','PASS_MAIL_REQUEST_CONFLICT');end if;
  select coalesce(jsonb_agg(jsonb_build_object(
   'id',m.id,'localPart',m.local_part,'expiresAt',m.expires_at
  ) order by m.created_at,m.id),'[]'::jsonb),count(*)
   into v_rows,v_count
  from public.temp_mailboxes m where m.pass_request_id=p_request_id and m.owner_user_id=p_user_id;
  if v_count<>p_count then
   return jsonb_build_object('ok',false,'error','PASS_MAIL_INCOMPLETE');end if;
  return jsonb_build_object('ok',true,'recovered',true,'count',v_count,'mailboxes',v_rows);
 end if;
 select * into v_source from public.lingxi_tool_use_events
  where request_id=p_request_id for update;
 if not found or v_source.user_id<>p_user_id or v_source.tool_slug<>'temp-mail'
  or v_source.units<>p_count or v_source.access_kind<>'pass'
 then return jsonb_build_object('ok',false,'error','PASS_MAIL_PAID_BATCH_REQUIRED');end if;
 if exists(select 1 from jsonb_array_elements(p_entries) as x(item)
  where jsonb_typeof(x.item) is distinct from 'object'
    or (x.item->>'local_part') is null
    or (x.item->>'token_hash') is null
    or (x.item->>'local_part') !~ '^[a-z0-9]{6,32}$'
    or (x.item->>'token_hash') !~ '^[a-f0-9]{64}$'
 ) then return jsonb_build_object('ok',false,'error','PASS_MAIL_ENTRIES_INVALID');end if;
 -- Hard per-account/day storage cap, including legacy batch mailboxes.
 select count(*) into v_today_count from public.temp_mailboxes
  where owner_user_id=p_user_id and source_kind='batch'
   and created_at>=date_trunc('day',now() at time zone 'Asia/Shanghai') at time zone 'Asia/Shanghai';
 if v_today_count+p_count>100 then
  return jsonb_build_object('ok',false,'error','PASS_MAIL_DAILY_LIMIT');end if;
 -- Receipt is consumed inside the same SQL transaction as all mailboxes.
 -- An insert failure raises and rolls the whole request/stage redemption back.
 v_stage:=public.lingxi_redeem_tool_stage(p_request_id,p_user_id,'temp-mail',p_operation_id,'temp-mail-batch');
 if coalesce((v_stage->>'ok')::boolean,false) is not true then return v_stage;end if;
 if coalesce((v_stage->>'alreadyStarted')::boolean,false) then
  return jsonb_build_object('ok',false,'error','PASS_MAIL_STAGE_ALREADY_STARTED');end if;
 insert into public.lingxi_tool_pass_mail_batches(request_id,user_id,operation_id,mailbox_count)
 values(p_request_id,p_user_id,p_operation_id,p_count);
 insert into public.temp_mailboxes(
  local_part,token_hash,expires_at,owner_user_id,source_kind,pass_request_id)
 select x.item->>'local_part',x.item->>'token_hash',now()+interval '10 minutes',
  p_user_id,'batch',p_request_id
 from jsonb_array_elements(p_entries) as x(item);
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',m.id,'localPart',m.local_part,'expiresAt',m.expires_at
 ) order by m.created_at,m.id),'[]'::jsonb),count(*)
 into v_rows,v_count from public.temp_mailboxes m
 where m.pass_request_id=p_request_id and m.owner_user_id=p_user_id;
 if v_count<>p_count then raise exception 'PASS_MAIL_ATOMIC_BATCH_INCOMPLETE';end if;
 return jsonb_build_object('ok',true,'recovered',false,'count',v_count,'mailboxes',v_rows);
end $$;
revoke all on function public.lingxi_create_pass_mail_batch(uuid,uuid,uuid,integer,jsonb)
 from public,anon,authenticated;
grant execute on function public.lingxi_create_pass_mail_batch(uuid,uuid,uuid,integer,jsonb)
 to service_role;
commit;
