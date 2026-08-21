-- v301: Explicitly connect a Mini Program identity to an existing Lingxi web account.
-- Run once in Supabase SQL Editor before exposing the "连接已有灵犀账户" button.
-- This never guesses an identity: the application verifies both a short-lived
-- Mini-session ticket and an authenticated target web account before calling it.

create or replace function public.link_mini_identity_to_account(
  p_openid text,
  p_source_user_id uuid,
  p_target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identity_user_id uuid;
  v_target_openid text;
  v_source_manifest_until timestamptz;
  v_target_manifest_until timestamptz;
  v_order_count integer := 0;
  v_report_count integer := 0;
  v_rows integer := 0;
begin
  if p_source_user_id = p_target_user_id then
    return jsonb_build_object('ok', true, 'alreadyLinked', true);
  end if;

  select user_id into v_identity_user_id
  from public.wechat_mini_identities
  where openid = p_openid
  for update;
  if v_identity_user_id is null or v_identity_user_id <> p_source_user_id then
    raise exception 'mini identity does not match source account';
  end if;

  select openid into v_target_openid
  from public.wechat_mini_identities
  where user_id = p_target_user_id;
  if v_target_openid is not null and v_target_openid <> p_openid then
    raise exception 'target account already has another mini identity';
  end if;

  select manifest_until into v_source_manifest_until from public.profiles where id = p_source_user_id;
  select manifest_until into v_target_manifest_until from public.profiles where id = p_target_user_id;
  insert into public.profiles (id, manifest_until)
  values (p_target_user_id, greatest(v_source_manifest_until, v_target_manifest_until))
  on conflict (id) do update set manifest_until = greatest(excluded.manifest_until, public.profiles.manifest_until);

  -- Merge entitlement rows without shortening an existing expiry. Null means permanent.
  insert into public.unlocks (user_id, product_id, expires_at)
  select p_target_user_id, product_id, expires_at
  from public.unlocks where user_id = p_source_user_id
  on conflict (user_id, product_id) do update set expires_at = case
    when public.unlocks.expires_at is null or excluded.expires_at is null then null
    else greatest(public.unlocks.expires_at, excluded.expires_at)
  end;
  delete from public.unlocks where user_id = p_source_user_id;

  update public.orders set user_id = p_target_user_id where user_id = p_source_user_id;
  get diagnostics v_order_count = row_count;
  update public.life_map_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_report_count = row_count;
  update public.relationship_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.qian_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.tarot_reading_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.resilience_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.romance_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.daily_tide_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.wealth_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;

  update public.wechat_mini_sessions set user_id = p_target_user_id where user_id = p_source_user_id and openid = p_openid;
  update public.wechat_mini_identities set user_id = p_target_user_id, updated_at = now() where openid = p_openid;

  return jsonb_build_object('ok', true, 'ordersMoved', v_order_count, 'reportsMoved', v_report_count);
end;
$$;

revoke execute on function public.link_mini_identity_to_account(text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.link_mini_identity_to_account(text, uuid, uuid) to service_role;
