-- File-based burn note: atomic one-task receipt, note and private R2 metadata.
-- Preserve every legacy paid quote and previously shared URL.
-- Staged for isolated CI; do not apply to production before a release gate.
begin;
alter table public.burn_notes
 add column if not exists access_request_id uuid,
 add column if not exists operation_id uuid,
 add column if not exists file_input_digest text;
create unique index if not exists burn_notes_pass_request_unique
 on public.burn_notes(access_request_id)
 where access_request_id is not null;
alter table public.burn_files add column if not exists part_index integer;
create unique index if not exists burn_files_note_part_unique
 on public.burn_files(note_id,part_index) where part_index is not null;
create or replace function public.lingxi_prepare_pass_burn_file_v1(
 p_user_id uuid,p_request_id uuid,p_operation_id uuid,p_note_id uuid,
 p_ciphertext text,p_iv text,p_ttl_minutes integer,p_mode text,
 p_max_views integer,p_duration integer,p_input_digest text,p_files jsonb
)returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_old public.burn_notes%rowtype;
 v_stage jsonb;
 v_use public.lingxi_tool_use_events%rowtype;
 v_exp timestamptz;
 v_total bigint;
 v_len integer;
 v_file jsonb;
 v_order bigint;
 v_files jsonb;
begin
 v_len:=case when jsonb_typeof(p_files)='array' then jsonb_array_length(p_files) else 0 end;
 if p_user_id is null or p_request_id is null or p_operation_id is null or p_note_id is null
 or p_ciphertext is null or length(p_ciphertext)<10 or length(p_ciphertext)>400000
 or p_iv is null or length(p_iv)<8 or length(p_iv)>100
 or p_ttl_minutes not in (10,60,1440,4320,10080)
 or p_mode not in ('once','timed','limited','fast')
 or p_max_views not in (1,3,5)
 or (p_mode='fast' and (p_duration is null or p_duration not in (5,10,30,60)))
 or p_input_digest !~ '^[a-f0-9]{64}$'
 or v_len<1 or v_len>20
 then return jsonb_build_object('ok',false,'error','INVALID_PASS_BURN_FILE_INPUT');end if;
 v_total:=0;
 for v_file,v_order in select value,ordinality from jsonb_array_elements(p_files) with ordinality loop
  if jsonb_typeof(v_file)<>'object' or
     jsonb_typeof(v_file->'size')<>'number' or
     (v_file->>'size') !~ '^[0-9]{1,13}$' or
     coalesce(length(v_file->>'name'),0)<1 or length(v_file->>'name')>180 or
     coalesce(length(v_file->>'mime'),0)<1 or length(v_file->>'mime')>120 or
     v_file->>'objectKey' not like ('burn/'||p_note_id::text||'/%')
  then return jsonb_build_object('ok',false,'error','INVALID_PASS_BURN_FILE_META');end if;
  if (v_file->>'size')::bigint<1 or (v_file->>'size')::bigint>2147483648
  then return jsonb_build_object('ok',false,'error','INVALID_PASS_BURN_FILE_SIZE');end if;
  v_total:=v_total+(v_file->>'size')::bigint;
 end loop;
 if v_total>2147483648 then return jsonb_build_object('ok',false,'error','PASS_BURN_FILES_TOO_LARGE');end if;
 perform pg_advisory_xact_lock(hashtextextended('lingxi-burnfile:'||p_request_id::text,0));
 select * into v_old from public.burn_notes where access_request_id=p_request_id for update;
 if found then
  if v_old.owner_user_id is distinct from p_user_id
   or v_old.operation_id is distinct from p_operation_id
   or v_old.file_input_digest is distinct from p_input_digest
   or v_old.id is distinct from p_note_id
  then return jsonb_build_object('ok',false,'error','PASS_BURN_FILE_REBIND');end if;
  if v_old.consumed_at is not null or v_old.expires_at<=now()
  then return jsonb_build_object('ok',false,'error','PASS_BURN_FILE_GONE');end if;
  select jsonb_agg(jsonb_build_object('id',f.id,'objectKey',f.object_key,
   'name',f.original_name,'size',f.size_bytes,'type',f.mime_type) order by f.part_index)
  into v_files from public.burn_files f where f.note_id=v_old.id;
  if jsonb_array_length(coalesce(v_files,'[]'::jsonb))<>v_len
  then return jsonb_build_object('ok',false,'error','PASS_BURN_FILE_ROWS_MISMATCH');end if;
  return jsonb_build_object('ok',true,'recovered',true,'alreadyReady',v_old.ready_at is not null,
   'id',v_old.id,'expiresAt',v_old.expires_at,'files',v_files);
 end if;
 select * into v_use from public.lingxi_tool_use_events
 where request_id=p_request_id for update;
 if not found or v_use.user_id<>p_user_id or v_use.tool_slug<>'burn-after-read'
 or v_use.units<>v_len then return jsonb_build_object('ok',false,'error','PASS_BURN_FILE_UNITS_MISMATCH');end if;
 -- All-or-nothing: a stage is consumed only if both note + files persist.
 v_stage:=public.lingxi_redeem_tool_stage(
  p_request_id,p_user_id,'burn-after-read',p_operation_id,'burn-file-prepare');
 if coalesce((v_stage->>'ok')::boolean,false) is not true then return v_stage;end if;
 if coalesce((v_stage->>'alreadyStarted')::boolean,false)
 then return jsonb_build_object('ok',false,'error','PASS_BURN_STAGE_INCONSISTENT');end if;
 v_exp:=now()+make_interval(mins=>p_ttl_minutes);
 insert into public.burn_notes(
   id,owner_user_id,ciphertext,iv,expires_at,mode,max_views,
   view_duration_seconds,has_files,quote_id,access_request_id,
   operation_id,file_input_digest
 ) values(
   p_note_id,p_user_id,p_ciphertext,p_iv,v_exp,p_mode,p_max_views,
   case when p_mode='fast' then p_duration else null end,true,null,
   p_request_id,p_operation_id,p_input_digest
 );
 insert into public.burn_files(
   note_id,object_key,original_name,size_bytes,mime_type,part_index
 )
 select p_note_id,entry.value->>'objectKey',entry.value->>'name',
        (entry.value->>'size')::bigint,entry.value->>'mime',
        entry.ordinality::integer-1
 from jsonb_array_elements(p_files) with ordinality as entry;
 select jsonb_agg(jsonb_build_object('id',f.id,'objectKey',f.object_key,
   'name',f.original_name,'size',f.size_bytes,'type',f.mime_type) order by f.part_index)
 into v_files from public.burn_files f where f.note_id=p_note_id;
 return jsonb_build_object('ok',true,'recovered',false,'alreadyReady',false,
  'id',p_note_id,'expiresAt',v_exp,'files',v_files);
end $$;
revoke all on function public.lingxi_prepare_pass_burn_file_v1(
 uuid,uuid,uuid,uuid,text,text,integer,text,integer,integer,text,jsonb)
 from public,anon,authenticated;
grant execute on function public.lingxi_prepare_pass_burn_file_v1(
 uuid,uuid,uuid,uuid,text,text,integer,text,integer,integer,text,jsonb)
 to service_role;
commit;
