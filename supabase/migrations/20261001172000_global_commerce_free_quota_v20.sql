begin;

create table if not exists public.tool_free_entitlements(
 id bigserial primary key,
 user_id uuid not null,
 tool_key text not null,
 ip_hash text not null,
 usage_day date not null,
 created_at timestamptz not null default now()
);
create index if not exists idx_tool_free_entitlements_user_tool_day on public.tool_free_entitlements(user_id,tool_key,usage_day);
create index if not exists idx_tool_free_entitlements_ip_tool on public.tool_free_entitlements(ip_hash,tool_key);

create or replace function public.claim_tool_free_entitlement(
 p_user_id uuid,p_tool_key text,p_ip_hash text,p_usage_day date
) returns boolean
language plpgsql security definer set search_path=public
as $$
declare v_exists boolean;
begin
 if p_user_id is null or coalesce(length(p_tool_key),0)<3 or coalesce(length(p_ip_hash),0)<32 then return false; end if;

 if p_tool_key='image-watermark-daily' then
  perform pg_advisory_xact_lock(hashtext(p_user_id::text||':'||p_tool_key||':'||p_usage_day::text));
  select exists(select 1 from public.tool_free_entitlements where user_id=p_user_id and tool_key=p_tool_key and usage_day=p_usage_day) into v_exists;
 elsif p_tool_key in('video-watermark-lifetime','video-dubbing-preview') then
  perform pg_advisory_xact_lock(hashtext(p_user_id::text||':'||p_tool_key));
  select exists(
   select 1 from public.tool_free_entitlements
   where tool_key=p_tool_key and (user_id=p_user_id or ip_hash=p_ip_hash)
  ) into v_exists;
 else
  return false;
 end if;

 if v_exists then return false; end if;
 insert into public.tool_free_entitlements(user_id,tool_key,ip_hash,usage_day) values(p_user_id,p_tool_key,p_ip_hash,p_usage_day);
 return true;
end $$;

revoke all on public.tool_free_entitlements from anon,authenticated;
revoke all on function public.claim_tool_free_entitlement(uuid,text,text,date) from public,anon,authenticated;

-- Exact user-approved independent CNY/USD prices.
insert into public.tool_pricing(
 tool_id,billing_type,unit_name,
 base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,
 base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,enabled
) values
 ('image-watermark-remover','per_image','image',0,0.60,0.60,999,'{"free":"account_daily_1"}',0,0.60,0.60,999,'{"free":"account_daily_1"}',true),
 ('batch-image-watermark-remover','per_image','image',0,0.50,0.50,999,'{}',0,0.50,0.50,999,'{}',true),
 ('video-watermark-remover','per_minute','minute',0,1.50,1.50,999,'{"free":"account_ip_lifetime_60s"}',0,1.50,1.50,999,'{"free":"account_ip_lifetime_60s"}',true),
 ('video-dubbing','per_minute','minute',0,3.00,3.00,999,'{"free":"account_lifetime_preview_30s"}',0,3.00,3.00,999,'{"free":"account_lifetime_preview_30s"}',true),
 ('subtitle-translate','per_minute','minute',0,0.30,0.60,999,'{"free_preview_lines":10}',0,0.30,0.60,999,'{"free_preview_lines":10}',true),
 ('id-photo-ai','per_export','export',0,1.00,1.00,99,'{"preview_free":true}',0,1.00,1.00,99,'{"preview_free":true}',true)
on conflict(tool_id) do update set
 billing_type=excluded.billing_type,unit_name=excluded.unit_name,
 base_price_rmb=excluded.base_price_rmb,unit_price_rmb=excluded.unit_price_rmb,min_price_rmb=excluded.min_price_rmb,max_price_rmb=excluded.max_price_rmb,pricing_json=excluded.pricing_json,
 base_price_usd=excluded.base_price_usd,unit_price_usd=excluded.unit_price_usd,min_price_usd=excluded.min_price_usd,max_price_usd=excluded.max_price_usd,pricing_json_usd=excluded.pricing_json_usd,
 enabled=true;

commit;
