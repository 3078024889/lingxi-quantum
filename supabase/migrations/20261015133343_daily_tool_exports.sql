-- Daily export limits use the business day in Asia/Shanghai, not the browser clock.
create table if not exists public.tool_daily_export_usage (
 tool_id text not null, usage_day date not null, subject_key text not null,
 free_used integer not null check(free_used between 0 and 5),
 primary key(tool_id,usage_day,subject_key)
);
create table if not exists public.tool_export_requests (
 id uuid primary key, tool_id text not null, user_id uuid references auth.users(id),
 ip_hash text not null, usage_day date not null, units integer not null check(units between 1 and 1000),
 free_units integer not null, paid_units integer not null,
 state text not null check(state in ('free','payment_required','paid')),
 created_at timestamptz not null default now(),
 check(free_units>=0 and paid_units>=0 and free_units+paid_units=units)
);
alter table public.tool_daily_export_usage enable row level security;
alter table public.tool_export_requests enable row level security;
revoke all on public.tool_daily_export_usage,public.tool_export_requests from anon,authenticated;
grant all on public.tool_daily_export_usage,public.tool_export_requests to service_role;

create or replace function public.reserve_tool_daily_export(p_id uuid,p_tool_id text,p_user_id uuid,p_ip_hash text,p_units integer)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 v_day date := (now() at time zone 'Asia/Shanghai')::date;
 v_ip_used integer:=0; v_account_used integer:=0; v_free integer;
 v_row public.tool_export_requests%rowtype;
begin
 if p_units is null or p_units<1 or p_units>1000 or p_tool_id !~ '^[a-z0-9-]{1,80}$' or p_ip_hash !~ '^[a-f0-9]{64}$' then raise exception 'EXPORT_INPUT_INVALID'; end if;
 -- A short transaction serializes competing claims for this tool/day, including
 -- two accounts on one IP and one account arriving through different IPs.
 perform pg_advisory_xact_lock(hashtextextended('tool-export:'||p_tool_id||':'||v_day::text,0));
 select * into v_row from public.tool_export_requests where id=p_id for update;
 if found then
  if v_row.tool_id<>p_tool_id or v_row.units<>p_units or
   (v_row.user_id is not null and v_row.user_id is distinct from p_user_id) or
   (v_row.user_id is null and v_row.ip_hash<>p_ip_hash) then raise exception 'EXPORT_REQUEST_MISMATCH'; end if;
  if v_row.user_id is null and p_user_id is not null then
   update public.tool_export_requests set user_id=p_user_id where id=p_id returning * into v_row;
   insert into public.tool_daily_export_usage values(p_tool_id,v_row.usage_day,'account:'||p_user_id::text,v_row.free_units)
   on conflict(tool_id,usage_day,subject_key) do update set free_used=least(5,tool_daily_export_usage.free_used+excluded.free_used);
  end if;
  if v_row.state='payment_required' and p_user_id is not null and exists(
   select 1 from public.tool_payment_quotes q join public.tool_export_grants g on g.quote_id=q.id
   where q.user_id=p_user_id and g.user_id=p_user_id and q.tool_id='metered-tool-export'
    and q.status='paid' and q.quantity=v_row.paid_units
    and q.metadata->>'exportRequestId'=p_id::text and q.metadata->>'draftId'=p_id::text
    and g.consumed_at is not null and g.revoked_at is null
  ) then update public.tool_export_requests set state='paid' where id=p_id returning * into v_row; end if;
  return to_jsonb(v_row);
 end if;
 select free_used into v_ip_used from public.tool_daily_export_usage where tool_id=p_tool_id and usage_day=v_day and subject_key='ip:'||p_ip_hash;
 if p_user_id is not null then
  select free_used into v_account_used from public.tool_daily_export_usage where tool_id=p_tool_id and usage_day=v_day and subject_key='account:'||p_user_id::text;
 end if;
 v_free:=least(p_units,greatest(0,5-coalesce(v_ip_used,0)),greatest(0,5-coalesce(v_account_used,0)));
 insert into public.tool_daily_export_usage values(p_tool_id,v_day,'ip:'||p_ip_hash,v_free)
 on conflict(tool_id,usage_day,subject_key) do update set free_used=tool_daily_export_usage.free_used+excluded.free_used;
 if p_user_id is not null then
  insert into public.tool_daily_export_usage values(p_tool_id,v_day,'account:'||p_user_id::text,v_free)
  on conflict(tool_id,usage_day,subject_key) do update set free_used=tool_daily_export_usage.free_used+excluded.free_used;
 end if;
 insert into public.tool_export_requests(id,tool_id,user_id,ip_hash,usage_day,units,free_units,paid_units,state)
 values(p_id,p_tool_id,p_user_id,p_ip_hash,v_day,p_units,v_free,p_units-v_free,case when v_free=p_units then 'free' else 'payment_required' end) returning * into v_row;
 return to_jsonb(v_row);
end $$;
revoke all on function public.reserve_tool_daily_export(uuid,text,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.reserve_tool_daily_export(uuid,text,uuid,text,integer) to service_role;
insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,enabled)
values('metered-tool-export','per_file','file',0,1,1,null,'{}'::jsonb,0,1,1,null,'{}'::jsonb,true)
on conflict(tool_id) do nothing;
create unique index if not exists tool_export_quote_unique on public.tool_payment_quotes(user_id,(metadata->>'exportRequestId'))
where tool_id='metered-tool-export' and status in ('quoted','ordered','paid');
