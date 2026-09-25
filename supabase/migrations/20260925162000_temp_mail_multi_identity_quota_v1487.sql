begin;

-- Multi-signal daily quota for temporary mail.
-- A free creation must pass every supplied identity bucket. The function locks
-- buckets in deterministic order so concurrent requests cannot oversubscribe
-- the daily allowance.
create or replace function public.consume_temp_mail_free_quota_multi(
  p_identity_hashes text[],
  p_limits integer[]
)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_rec record;
  v_count integer;
  v_remaining integer := 2147483647;
  v_len integer;
begin
  v_len := coalesce(array_length(p_identity_hashes,1),0);

  if v_len=0
     or v_len<>coalesce(array_length(p_limits,1),0)
     or v_len>8 then
    raise exception 'INVALID_QUOTA_BUCKETS';
  end if;

  if exists (
    select 1
    from unnest(p_identity_hashes,p_limits) as x(identity_hash,limit_value)
    where nullif(btrim(identity_hash),'') is null
       or length(identity_hash)>128
       or limit_value<1
       or limit_value>10000
  ) then
    raise exception 'INVALID_QUOTA_BUCKET';
  end if;

  if (
    select count(distinct identity_hash)
    from unnest(p_identity_hashes) as x(identity_hash)
  ) <> v_len then
    raise exception 'DUPLICATE_QUOTA_BUCKET';
  end if;

  -- Deterministic transaction locks prevent parallel requests from both seeing
  -- the same pre-increment count.
  for v_rec in
    select identity_hash,limit_value
    from unnest(p_identity_hashes,p_limits) as x(identity_hash,limit_value)
    order by identity_hash
  loop
    perform pg_advisory_xact_lock(hashtextextended(v_rec.identity_hash,0));
  end loop;

  -- Fail closed before incrementing any bucket if one identity has exhausted
  -- its allowance. This keeps the operation all-or-nothing.
  for v_rec in
    select identity_hash,limit_value
    from unnest(p_identity_hashes,p_limits) as x(identity_hash,limit_value)
    order by identity_hash
  loop
    select temp_mail_count into v_count
    from public.privacy_daily_usage
    where identity_hash=v_rec.identity_hash
      and usage_date=v_today;

    v_count := coalesce(v_count,0);
    if v_count>=v_rec.limit_value then
      return jsonb_build_object(
        'allowed',false,
        'remaining',0
      );
    end if;
  end loop;

  for v_rec in
    select identity_hash,limit_value
    from unnest(p_identity_hashes,p_limits) as x(identity_hash,limit_value)
    order by identity_hash
  loop
    insert into public.privacy_daily_usage(identity_hash,usage_date,temp_mail_count,updated_at)
    values(v_rec.identity_hash,v_today,1,now())
    on conflict(identity_hash,usage_date) do update
      set temp_mail_count=public.privacy_daily_usage.temp_mail_count+1,
          updated_at=now()
    returning temp_mail_count into v_count;

    v_remaining := least(v_remaining,greatest(0,v_rec.limit_value-v_count));
  end loop;

  return jsonb_build_object(
    'allowed',true,
    'remaining',greatest(0,v_remaining)
  );
end
$$;

revoke all on function public.consume_temp_mail_free_quota_multi(text[],integer[])
from public,anon,authenticated;
grant execute on function public.consume_temp_mail_free_quota_multi(text[],integer[])
to service_role,postgres;

commit;
