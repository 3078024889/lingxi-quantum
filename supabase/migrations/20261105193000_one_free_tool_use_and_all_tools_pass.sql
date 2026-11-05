-- Unified one-free-use-per-account/IP/tool/day with paid all-tools pass.
-- New tables only: keep historical payment ledgers and grants for refund reconciliation.
begin;

create table if not exists public.lingxi_tool_passes (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 sku text not null check (sku in ('tool_pass_7d','tool_pass_30d','tool_pass_90d','tool_pass_365d')),
 currency text not null check (currency in ('CNY','USD')),
 price_minor bigint not null check (price_minor > 0),
 purchase_request_id uuid not null unique,
 order_id uuid unique references public.orders(id),
 revoked_at timestamptz,
 revocation_reason text,
 starts_at timestamptz not null,
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 check (expires_at > starts_at)
);
create index if not exists lingxi_tool_passes_user_expiry on public.lingxi_tool_passes(user_id,expires_at desc);
alter table public.lingxi_tool_passes enable row level security;
revoke all on public.lingxi_tool_passes from anon,authenticated;
grant all on public.lingxi_tool_passes to service_role;

create table if not exists public.lingxi_tool_use_events (
 request_id uuid primary key,
 user_id uuid not null references auth.users(id),
 ip_hash text not null check (ip_hash ~ '^[a-f0-9]{64}$'),
 tool_slug text not null check (tool_slug ~ '^[a-z0-9-]{1,96}$'),
 units integer not null check (units between 1 and 1000),
 access_kind text not null check (access_kind in ('daily_free','pass')),
 usage_day date not null,
 created_at timestamptz not null default now()
);
create index if not exists lingxi_tool_use_account_day on public.lingxi_tool_use_events(tool_slug,usage_day,user_id) where access_kind='daily_free';
create index if not exists lingxi_tool_use_ip_day on public.lingxi_tool_use_events(tool_slug,usage_day,ip_hash) where access_kind='daily_free';
alter table public.lingxi_tool_use_events enable row level security;
revoke all on public.lingxi_tool_use_events from anon,authenticated;
grant all on public.lingxi_tool_use_events to service_role;

-- All validation and mutations must happen inside one transaction. Caller is server-side
-- service role after authenticating user, canonical tool registration and trusted IP hashing.
create or replace function public.lingxi_claim_tool_use(
 p_request_id uuid,p_user_id uuid,p_ip_hash text,p_tool_slug text,p_units integer
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 v_day date := (now() at time zone 'Asia/Shanghai')::date;
 v_existing public.lingxi_tool_use_events%rowtype;
 v_pass_until timestamptz;
 v_account_count integer;
 v_ip_count integer;
 v_kind text;
begin
 if p_request_id is null or p_user_id is null or p_ip_hash !~ '^[a-f0-9]{64}$'
    or p_tool_slug !~ '^[a-z0-9-]{1,96}$' or p_units is null or p_units < 1 or p_units>1000 then
   return jsonb_build_object('ok',false,'error','INVALID_TOOL_USE');
 end if;
 -- The lock covers free counters under account switching, IP switching and parallel requests.
 perform pg_advisory_xact_lock(hashtextextended('lingxi-use:'||p_tool_slug||':'||v_day::text,0));
 select * into v_existing from public.lingxi_tool_use_events where request_id=p_request_id;
 if found then
   if v_existing.user_id<>p_user_id or v_existing.ip_hash<>p_ip_hash
      or v_existing.tool_slug<>p_tool_slug or v_existing.units<>p_units then
      return jsonb_build_object('ok',false,'error','IDEMPOTENCY_CONFLICT');
   end if;
   return jsonb_build_object('ok',true,'alreadyClaimed',true,'accessKind',v_existing.access_kind);
 end if;
 select max(expires_at) into v_pass_until from public.lingxi_tool_passes
 where user_id=p_user_id and revoked_at is null and starts_at <= now() and expires_at > now();
 if v_pass_until is not null then
   v_kind:='pass';
 else
   -- Each file/video is a unit. With only one free use, two-file batch needs a pass.
   if p_units<>1 then return jsonb_build_object('ok',false,'error','TOOL_PASS_REQUIRED'); end if;
   select coalesce(sum(units),0) into v_account_count from public.lingxi_tool_use_events
   where tool_slug=p_tool_slug and usage_day=v_day and user_id=p_user_id and access_kind='daily_free';
   select coalesce(sum(units),0) into v_ip_count from public.lingxi_tool_use_events
   where tool_slug=p_tool_slug and usage_day=v_day and ip_hash=p_ip_hash and access_kind='daily_free';
   if v_account_count>=1 or v_ip_count>=1 then
      return jsonb_build_object('ok',false,'error','DAILY_TOOL_FREE_USED');
   end if;
   v_kind:='daily_free';
 end if;
 insert into public.lingxi_tool_use_events(request_id,user_id,ip_hash,tool_slug,units,access_kind,usage_day)
 values(p_request_id,p_user_id,p_ip_hash,p_tool_slug,p_units,v_kind,v_day);
 return jsonb_build_object('ok',true,'alreadyClaimed',false,'accessKind',v_kind,'usageDay',v_day,'passExpiresAt',v_pass_until);
end $$;
revoke all on function public.lingxi_claim_tool_use(uuid,uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.lingxi_claim_tool_use(uuid,uuid,text,text,integer) to service_role;

create or replace function public.lingxi_purchase_tool_pass(
 p_user_id uuid,p_request_id uuid,p_sku text,p_currency text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 v_old public.lingxi_tool_passes%rowtype;
 v_amount integer;
 v_days integer;
 v_now timestamptz:=now();
 v_start timestamptz;
 v_expiry timestamptz;
 v_paid jsonb;
 v_order uuid;
begin
 if p_user_id is null or p_request_id is null or p_currency not in ('CNY','USD') then
  return jsonb_build_object('ok',false,'error','INVALID_PASS_PURCHASE');
 end if;
 case p_sku
  when 'tool_pass_7d' then v_amount:=2900;v_days:=7;
  when 'tool_pass_30d' then v_amount:=9900;v_days:=30;
  when 'tool_pass_90d' then v_amount:=26900;v_days:=90;
  when 'tool_pass_365d' then v_amount:=89900;v_days:=365;
  else return jsonb_build_object('ok',false,'error','INVALID_PASS_SKU');
 end case;
 perform pg_advisory_xact_lock(hashtextextended('lingxi-pass:'||p_user_id::text,0));
 select * into v_old from public.lingxi_tool_passes where purchase_request_id=p_request_id;
 if found then
  if v_old.user_id<>p_user_id or v_old.sku<>p_sku or v_old.currency<>p_currency
   then return jsonb_build_object('ok',false,'error','IDEMPOTENCY_CONFLICT'); end if;
  return jsonb_build_object('ok',true,'alreadyPurchased',true,'expiresAt',v_old.expires_at,'orderId',v_old.order_id);
 end if;
 -- Never trust any client-supplied price. Reuse existing unified CNY/USD wallet.
 v_paid:=public.charge_sasi_usage_v49(p_user_id,p_currency,v_amount,
           'tool-pass:'||p_request_id::text,'tool_pass',
           jsonb_build_object('sku',p_sku,'durationDays',v_days));
 if coalesce((v_paid->>'ok')::boolean,false) is not true then return v_paid; end if;
 select greatest(v_now,coalesce(max(expires_at),v_now)) into v_start
 from public.lingxi_tool_passes where user_id=p_user_id and revoked_at is null and expires_at>v_now;
 v_expiry:=v_start + make_interval(days=>v_days);
 insert into public.orders(user_id,product_id,product_type,amount_rmb,amount_usd,currency,status,provider,submission_name,paid_at)
 values(p_user_id,'toolpass:'||p_request_id::text,'permanent',v_amount/100.0,v_amount/100.0,
        p_currency,'paid','sasi-balance','全场实用工具通用包 · '||v_days||'天',v_now)
 returning id into v_order;
 insert into public.lingxi_tool_passes(user_id,sku,currency,price_minor,purchase_request_id,order_id,starts_at,expires_at)
 values(p_user_id,p_sku,p_currency,v_amount,p_request_id,v_order,v_start,v_expiry);
 return jsonb_build_object('ok',true,'alreadyPurchased',false,'orderId',v_order,
                           'expiresAt',v_expiry,'startsAt',v_start,'currency',p_currency,'chargedMinor',v_amount);
 -- A database error rolls back BOTH wallet debit and entitlement/order.
end $$;
revoke all on function public.lingxi_purchase_tool_pass(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.lingxi_purchase_tool_pass(uuid,uuid,text,text) to service_role;
commit;
