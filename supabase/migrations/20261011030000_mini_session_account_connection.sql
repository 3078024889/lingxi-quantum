-- A web login connects one proven native session, never every phone or account.
create or replace function public.connect_mini_session_account(
  p_token_hash text, p_openid text, p_source_user_id uuid, p_target_user_id uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare current_user_id uuid;
begin
  select user_id into current_user_id from public.wechat_mini_sessions
    where token_hash=p_token_hash and openid=p_openid and expires_at>now() for update;
  if current_user_id is null then raise exception 'Mini session expired'; end if;
  if current_user_id=p_target_user_id then return jsonb_build_object('ok',true,'alreadyLinked',true); end if;
  if current_user_id<>p_source_user_id then raise exception 'Mini session account changed'; end if;
  if not exists(select 1 from auth.users where id=p_target_user_id and
    (phone is not null or (email is not null and email not like '%@mini.lingxifield.invalid'))) then
    raise exception 'A registered destination account is required';
  end if;
  -- A first-time guest may migrate its old funds through the existing atomic
  -- guest-only procedure. Registered accounts and their funds remain separate.
  if exists(select 1 from auth.users where id=p_source_user_id and email like '%@mini.lingxifield.invalid')
    and not exists(select 1 from public.wechat_mini_identities where user_id=p_target_user_id and openid<>p_openid)
    and exists(select 1 from public.wechat_mini_identities where user_id=p_source_user_id and openid=p_openid) then
    perform public.link_mini_identity_to_account(p_openid,p_source_user_id,p_target_user_id);
  else
    update public.wechat_mini_sessions set user_id=p_target_user_id
      where token_hash=p_token_hash and openid=p_openid and user_id=p_source_user_id;
  end if;
  return jsonb_build_object('ok',true);
end $$;
revoke all on function public.connect_mini_session_account(text,text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.connect_mini_session_account(text,text,uuid,uuid) to service_role;
