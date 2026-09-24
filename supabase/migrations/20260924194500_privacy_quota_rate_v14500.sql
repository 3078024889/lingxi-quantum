begin;

create table if not exists public.privacy_daily_usage(
  identity_hash text not null,
  usage_date date not null default (now() at time zone 'utc')::date,
  temp_mail_count integer not null default 0 check(temp_mail_count>=0),
  updated_at timestamptz not null default now(),
  primary key(identity_hash,usage_date)
);
alter table public.privacy_daily_usage enable row level security;
revoke all on public.privacy_daily_usage from public,anon,authenticated;

create or replace function public.privacy_rate_limit(p_key text,p_limit integer,p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare v_count integer;
begin
  insert into public.rate_limits(id,window_start,count)
  values(p_key,now(),1)
  on conflict(id) do update
  set count=case when rate_limits.window_start<now()-(p_window_seconds||' seconds')::interval then 1 else rate_limits.count+1 end,
      window_start=case when rate_limits.window_start<now()-(p_window_seconds||' seconds')::interval then now() else rate_limits.window_start end
  returning count into v_count;
  return v_count<=p_limit;
end $$;

create or replace function public.consume_temp_mail_free_quota(p_identity_hash text,p_limit integer default 10)
returns integer
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare v_count integer;
begin
  insert into public.privacy_daily_usage(identity_hash,usage_date,temp_mail_count,updated_at)
  values(p_identity_hash,(now() at time zone 'utc')::date,1,now())
  on conflict(identity_hash,usage_date) do update
    set temp_mail_count=privacy_daily_usage.temp_mail_count+1,updated_at=now()
    where privacy_daily_usage.temp_mail_count<p_limit
  returning temp_mail_count into v_count;
  if v_count is null then return -1; end if;
  return greatest(0,p_limit-v_count);
end $$;

revoke all on function public.privacy_rate_limit(text,integer,integer) from public,anon,authenticated;
revoke all on function public.consume_temp_mail_free_quota(text,integer) from public,anon,authenticated;
grant execute on function public.privacy_rate_limit(text,integer,integer) to service_role,postgres;
grant execute on function public.consume_temp_mail_free_quota(text,integer) to service_role,postgres;

insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,enabled,updated_at)
values('temp-mail-day-pass','per_day','day',1.90,0,1.90,1.90,'{}'::jsonb,true,now())
on conflict(tool_id) do update set
 billing_type=excluded.billing_type,unit_name=excluded.unit_name,base_price_rmb=excluded.base_price_rmb,
 unit_price_rmb=excluded.unit_price_rmb,min_price_rmb=excluded.min_price_rmb,max_price_rmb=excluded.max_price_rmb,
 pricing_json=excluded.pricing_json,enabled=true,updated_at=now();

commit;
