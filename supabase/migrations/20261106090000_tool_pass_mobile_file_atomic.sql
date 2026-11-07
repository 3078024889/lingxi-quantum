-- Bind private mobile-download R2 upload sessions to an already claimed
-- free/pass tool operation; preserve legacy rows and historical paid exports.
-- CI PostgreSQL17 validation first. DO NOT RUN against production before approval.
begin;
alter table public.tool_temp_files
 add column if not exists access_request_id uuid,
 add column if not exists operation_id uuid,
 add column if not exists source_tool_slug text;
create unique index if not exists tool_temp_files_access_request_unique
 on public.tool_temp_files(access_request_id)
 where access_request_id is not null;
create index if not exists tool_temp_files_owner_request
 on public.tool_temp_files(user_id,access_request_id)
 where access_request_id is not null;
-- RLS remains enabled as originally configured; direct client access remains
-- disabled. This function is called only through authenticated server code.
create or replace function public.lingxi_prepare_pass_mobile_file_v1(
 p_user_id uuid,p_request_id uuid,p_operation_id uuid,p_tool_slug text,
 p_name text,p_mime text,p_size bigint,p_object_key text
)returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_old public.tool_temp_files%rowtype;
 v_stage jsonb;
 v_exp timestamptz:=now()+interval '20 minutes';
begin
 if p_user_id is null or p_request_id is null or p_operation_id is null
   or p_tool_slug is null or p_tool_slug !~ '^[a-z0-9-]{1,96}$'
   or p_name is null or length(p_name)<1 or length(p_name)>180
   or p_mime is null or length(p_mime)>160
   or p_size is null or p_size<1 or p_size>104857600
   or p_object_key is null or length(p_object_key)>512
   or p_object_key !~ '^burn/'
 then return jsonb_build_object('ok',false,'error','INVALID_MOBILE_FILE_INPUT');end if;
 -- Serializes all first-creates and retries of the same logical claimed task.
 perform pg_advisory_xact_lock(hashtextextended('lingxi-pass-mobile:'||p_request_id::text,0));
 select * into v_old from public.tool_temp_files
  where access_request_id=p_request_id for update;
 if found then
  if v_old.user_id<>p_user_id or v_old.operation_id<>p_operation_id
    or v_old.source_tool_slug<>p_tool_slug
    or v_old.file_name<>p_name or v_old.mime_type<>p_mime
    or v_old.byte_size<>p_size
  then return jsonb_build_object('ok',false,'error','MOBILE_FILE_IDEMPOTENCY_CONFLICT');end if;
  if v_old.deleted_at is not null or v_old.expires_at<=now()
  then return jsonb_build_object('ok',false,'error','MOBILE_FILE_EXPIRED');end if;
  return jsonb_build_object('ok',true,'recovered',true,'objectKey',v_old.object_key,
    'expiresAt',v_old.expires_at);
 end if;
 -- The stage redemption and new upload session are one SQL transaction.
 -- If the insertion fails, stage redemption rolls back with it.
 v_stage:=public.lingxi_redeem_tool_stage(
   p_request_id,p_user_id,p_tool_slug,p_operation_id,'mobile-file');
 if coalesce((v_stage->>'ok')::boolean,false) is not true then return v_stage;end if;
 if coalesce((v_stage->>'alreadyStarted')::boolean,false) then
  return jsonb_build_object('ok',false,'error','MOBILE_FILE_STAGE_INCONSISTENT');
 end if;
 insert into public.tool_temp_files(
   user_id,object_key,file_name,mime_type,byte_size,expires_at,
   access_request_id,operation_id,source_tool_slug
 ) values(
   p_user_id,p_object_key,p_name,p_mime,p_size,v_exp,
   p_request_id,p_operation_id,p_tool_slug
 );
 return jsonb_build_object('ok',true,'recovered',false,
  'objectKey',p_object_key,'expiresAt',v_exp);
end $$;
revoke all on function public.lingxi_prepare_pass_mobile_file_v1(
 uuid,uuid,uuid,text,text,text,bigint,text) from public,anon,authenticated;
grant execute on function public.lingxi_prepare_pass_mobile_file_v1(
 uuid,uuid,uuid,text,text,text,bigint,text) to service_role;
commit;
