-- Keep a receipt after the private note is erased, without retaining its content.
alter table public.tool_export_requests add column if not exists operation_completed_at timestamptz;
alter table public.tool_export_requests add column if not exists operation_fingerprint text;
create or replace function public.create_metered_burn_note(
 p_id uuid,p_user_id uuid,p_ip_hash text,p_fingerprint text,
 p_ciphertext text,p_iv text,p_ttl_minutes integer,p_mode text,p_max_views integer,p_duration integer
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 claim jsonb; receipt public.tool_export_requests%rowtype; note public.burn_notes%rowtype;
begin
 if p_fingerprint is null or p_ciphertext is null or p_iv is null or p_ttl_minutes is null or p_mode is null or p_max_views is null
  or p_fingerprint !~ '^[a-f0-9]{64}$' or length(p_ciphertext)<10 or length(p_ciphertext)>400000
  or length(p_iv)<8 or length(p_iv)>100 or p_ttl_minutes not in (10,60,1440,4320,10080)
  or p_mode not in ('once','timed','limited','fast') or p_max_views not in (1,3,5)
  or (p_mode='fast' and (p_duration is null or p_duration not in (5,10,30,60))) then
  raise exception 'INVALID_NOTE';
 end if;
 claim:=public.reserve_tool_daily_export(p_id,'burn-after-read',p_user_id,p_ip_hash,1);
 if claim->>'state' not in ('free','paid') then return jsonb_build_object('state','payment_required'); end if;
 select * into receipt from public.tool_export_requests where id=p_id for update;
 if receipt.operation_completed_at is not null then
  if receipt.operation_fingerprint is distinct from p_fingerprint then raise exception 'EXPORT_REQUEST_MISMATCH'; end if;
  select * into note from public.burn_notes where id=p_id;
  if not found or note.consumed_at is not null or note.expires_at<=now() then return jsonb_build_object('state','gone'); end if;
  return jsonb_build_object('state','ready','id',note.id,'expires_at',note.expires_at);
 end if;
 insert into public.burn_notes(id,owner_user_id,ciphertext,iv,expires_at,mode,max_views,view_duration_seconds)
 values(p_id,p_user_id,p_ciphertext,p_iv,now()+make_interval(mins=>p_ttl_minutes),p_mode,p_max_views,
  case when p_mode='fast' then p_duration else null end) returning * into note;
 update public.tool_export_requests set operation_completed_at=now(),operation_fingerprint=p_fingerprint where id=p_id;
 return jsonb_build_object('state','ready','id',note.id,'expires_at',note.expires_at);
end $$;
revoke all on function public.create_metered_burn_note(uuid,uuid,text,text,text,text,integer,text,integer,integer) from public,anon,authenticated;
grant execute on function public.create_metered_burn_note(uuid,uuid,text,text,text,text,integer,text,integer,integer) to service_role;
