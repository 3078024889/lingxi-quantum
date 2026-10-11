alter table public.wechat_mini_sessions add column if not exists account_connected_at timestamptz;

-- A WeChat identity is not evidence of which website account this phone chose.
-- Only a handoff authenticated by the website can confirm the destination.
create or replace function public.connect_mini_session_account(
 p_token_hash text, p_openid text, p_source_user_id uuid, p_target_user_id uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare current_user_id uuid;
begin
 select user_id into current_user_id from public.wechat_mini_sessions
  where token_hash=p_token_hash and openid=p_openid and expires_at>now() for update;
 if current_user_id is null then raise exception 'Mini session expired'; end if;
 if not exists(select 1 from auth.users where id=p_target_user_id and
  (phone is not null or (email is not null and email not like '%@mini.lingxifield.invalid'))) then
  raise exception 'A registered destination account is required';
 end if;
 if current_user_id<>p_source_user_id and current_user_id<>p_target_user_id then
  raise exception 'Mini session account changed';
 end if;
 update public.wechat_mini_sessions set user_id=p_target_user_id, account_connected_at=now()
  where token_hash=p_token_hash and openid=p_openid;
 return jsonb_build_object('ok',true,'alreadyLinked',current_user_id=p_target_user_id);
end $$;
revoke all on function public.connect_mini_session_account(text,text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.connect_mini_session_account(text,text,uuid,uuid) to service_role;
