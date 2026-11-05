begin;
alter table public.burn_notes add column if not exists pass_fingerprint text;
create or replace function public.lingxi_create_pass_burn_note(
 p_id uuid,p_user_id uuid,p_access_request_id uuid,p_fingerprint text,
 p_ciphertext text,p_iv text,p_ttl_minutes integer,p_mode text,
 p_max_views integer,p_duration integer
)returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.burn_notes%rowtype;proof jsonb;
begin
 if p_id is null or p_user_id is null or p_access_request_id is null
  or p_fingerprint !~ '^[a-f0-9]{64}$'
  or length(p_ciphertext)<10 or length(p_ciphertext)>400000
  or length(p_iv)<8 or length(p_iv)>100
  or p_ttl_minutes not in(10,60,1440,4320,10080)
  or p_mode not in('once','timed','limited','fast')
  or p_max_views not in(1,3,5)
  or (p_mode='fast' and (p_duration is null or p_duration not in(5,10,30,60)))
 then raise exception 'INVALID_NOTE';end if;
 select * into v from public.burn_notes where id=p_id for update;
 if found then
  if v.owner_user_id is distinct from p_user_id or v.pass_fingerprint is distinct from p_fingerprint
   then raise exception 'NOTE_BINDING_MISMATCH';end if;
  if v.consumed_at is not null or v.expires_at<=now()
   then return jsonb_build_object('state','gone');end if;
  return jsonb_build_object('state','ready','id',v.id,'expires_at',v.expires_at);
 end if;
 proof:=public.lingxi_redeem_tool_use(p_access_request_id,p_user_id,'burn-after-read',p_id);
 if proof->>'ok'<>'true' then raise exception 'TOOL_USE_RECEIPT_INVALID';end if;
 insert into public.burn_notes(
   id,owner_user_id,ciphertext,iv,expires_at,mode,max_views,view_duration_seconds,pass_fingerprint
 )values(
   p_id,p_user_id,p_ciphertext,p_iv,now()+make_interval(mins=>p_ttl_minutes),
   p_mode,p_max_views,case when p_mode='fast' then p_duration else null end,p_fingerprint
 )on conflict(id) do nothing;
 select * into v from public.burn_notes where id=p_id;
 if v.owner_user_id is distinct from p_user_id or v.pass_fingerprint is distinct from p_fingerprint
  then raise exception 'NOTE_BINDING_MISMATCH';end if;
 return jsonb_build_object('state','ready','id',v.id,'expires_at',v.expires_at);
end $$;
revoke all on function public.lingxi_create_pass_burn_note(uuid,uuid,uuid,text,text,text,integer,text,integer,integer)
 from public,anon,authenticated;
grant execute on function public.lingxi_create_pass_burn_note(uuid,uuid,uuid,text,text,text,integer,text,integer,integer)
 to service_role;
commit;
