-- Proposed migration draft, NOT APPLIED. Create a proper Supabase migration only
-- after local/staging verification using the pinned CLI. Do not run directly
-- against production while LINGXIFIELD_TOOL_PASS_ENABLED remains disabled.
-- Atomic wallet-funded entitlement uses the EXISTING charge_sasi_usage_v49
-- ledger function; there is no replacement wallet and no cross-currency FX.
begin;

create table if not exists public.tool_pass_allowed_v2 (
  tool_id text primary key,
  registry_version text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint tool_pass_tool_id_syntax check (tool_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
insert into public.tool_pass_allowed_v2(tool_id,registry_version) values
 ('avif-to-jpg','2026-11-05'),
 ('base64-encode-decode','2026-11-05'),
 ('batch-image','2026-11-05'),
 ('batch-pdf','2026-11-05'),
 ('bmp-to-png','2026-11-05'),
 ('case-converter','2026-11-05'),
 ('compress-image','2026-11-05'),
 ('compress-image-to-100kb','2026-11-05'),
 ('compress-image-to-200kb','2026-11-05'),
 ('compress-image-to-20kb','2026-11-05'),
 ('compress-image-to-500kb','2026-11-05'),
 ('compress-image-to-50kb','2026-11-05'),
 ('compress-pdf','2026-11-05'),
 ('cron-parser','2026-11-05'),
 ('cross-page-stamp','2026-11-05'),
 ('csv-json','2026-11-05'),
 ('csv-to-xlsx','2026-11-05'),
 ('document-copy-layout','2026-11-05'),
 ('docx-to-txt','2026-11-05'),
 ('e-sign-pdf','2026-11-05'),
 ('epub-to-txt','2026-11-05'),
 ('file-compare','2026-11-05'),
 ('file-type-detector','2026-11-05'),
 ('gif-to-jpg','2026-11-05'),
 ('heic-local','2026-11-05'),
 ('heic-to-jpg','2026-11-05'),
 ('ico-to-png','2026-11-05'),
 ('ics-to-csv','2026-11-05'),
 ('image-to-pdf','2026-11-05'),
 ('image-to-pdf-pro','2026-11-05'),
 ('jfif-to-jpg','2026-11-05'),
 ('jpg-to-png','2026-11-05'),
 ('json-formatter','2026-11-05'),
 ('jwt-decoder','2026-11-05'),
 ('long-image','2026-11-05'),
 ('loop-video','2026-11-05'),
 ('md5-sha256','2026-11-05'),
 ('merge-pdf','2026-11-05'),
 ('number-base-converter','2026-11-05'),
 ('odt-to-txt','2026-11-05'),
 ('pdf-attachments','2026-11-05'),
 ('pdf-bates-numbering','2026-11-05'),
 ('pdf-bookmarks','2026-11-05'),
 ('pdf-compare','2026-11-05'),
 ('pdf-compress','2026-11-05'),
 ('pdf-crop','2026-11-05'),
 ('pdf-editor','2026-11-05'),
 ('pdf-flatten','2026-11-05'),
 ('pdf-grayscale','2026-11-05'),
 ('pdf-halve-pages','2026-11-05'),
 ('pdf-header-footer','2026-11-05'),
 ('pdf-inspect','2026-11-05'),
 ('pdf-merge-split','2026-11-05'),
 ('pdf-metadata-editor','2026-11-05'),
 ('pdf-overlay','2026-11-05'),
 ('pdf-page-numbers','2026-11-05'),
 ('pdf-page-size','2026-11-05'),
 ('pdf-pages','2026-11-05'),
 ('pdf-pages-per-sheet','2026-11-05'),
 ('pdf-permissions','2026-11-05'),
 ('pdf-protect','2026-11-05'),
 ('pdf-rasterize','2026-11-05'),
 ('pdf-redact','2026-11-05'),
 ('pdf-remove-annotations','2026-11-05'),
 ('pdf-remove-metadata','2026-11-05'),
 ('pdf-search','2026-11-05'),
 ('pdf-to-jpg','2026-11-05'),
 ('pdf-to-markdown','2026-11-05'),
 ('pdf-to-text','2026-11-05'),
 ('pdf-unlock','2026-11-05'),
 ('pdf-viewer-preferences','2026-11-05'),
 ('pdf-watermark','2026-11-05'),
 ('pdf-web-optimize','2026-11-05'),
 ('png-to-jpg','2026-11-05'),
 ('pptx-to-txt','2026-11-05'),
 ('privacy-cleaner','2026-11-05'),
 ('qr-code-generator','2026-11-05'),
 ('qr-code-reader','2026-11-05'),
 ('qr-safe-reader','2026-11-05'),
 ('regex-tester','2026-11-05'),
 ('remove-duplicate-lines','2026-11-05'),
 ('remove-empty-lines','2026-11-05'),
 ('remove-exif','2026-11-05'),
 ('resize-image','2026-11-05'),
 ('reverse-video','2026-11-05'),
 ('rotate-video','2026-11-05'),
 ('screenshot-redact','2026-11-05'),
 ('split-pdf','2026-11-05'),
 ('stop-motion-video','2026-11-05'),
 ('subtitle-tools','2026-11-05'),
 ('svg-to-png','2026-11-05'),
 ('text-counter','2026-11-05'),
 ('text-diff','2026-11-05'),
 ('timestamp-converter','2026-11-05'),
 ('url-encode-decode','2026-11-05'),
 ('url-parser','2026-11-05'),
 ('uuid-generator','2026-11-05'),
 ('vcf-to-csv','2026-11-05'),
 ('video-toolkit','2026-11-05'),
 ('webp-to-jpg','2026-11-05'),
 ('xlsx-to-csv','2026-11-05'),
 ('xml-formatter','2026-11-05')
on conflict(tool_id) do nothing;

create table if not exists public.tool_pass_orders_v2 (
  request_id uuid primary key,
  user_id uuid not null,
  sku text not null check (sku in ('tools_7d','tools_30d','tools_90d','tools_365d')),
  currency text not null check (currency in ('CNY','USD')),
  amount_minor bigint not null check (amount_minor>0),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at>starts_at),
  state text not null default 'active' check (state in ('active','refunded','revoked')),
  created_at timestamptz not null default now()
);
create index if not exists tool_pass_orders_user_active_idx
  on public.tool_pass_orders_v2(user_id,ends_at desc) where state='active';

create table if not exists public.tool_pass_operation_v2 (
  operation_id uuid primary key,
  user_id uuid not null,
  tool_id text not null references public.tool_pass_allowed_v2(tool_id),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  access_kind text not null check(access_kind in ('free','pass')),
  claimed_at timestamptz not null default now()
);
-- Two separate uniqueness constraints prevent new accounts on the same
-- trusted IP *and* the same account at a new IP from claiming another
-- lifetime free use of this tool; purchase claims don't consume the free slot.
create unique index if not exists tool_pass_free_account_v2
 on public.tool_pass_operation_v2(user_id,tool_id) where access_kind='free';
create unique index if not exists tool_pass_free_ip_v2
 on public.tool_pass_operation_v2(ip_hash,tool_id) where access_kind='free';
create index if not exists tool_pass_ops_user_time_v2
 on public.tool_pass_operation_v2(user_id,claimed_at desc);

alter table public.tool_pass_allowed_v2 enable row level security;
alter table public.tool_pass_orders_v2 enable row level security;
alter table public.tool_pass_operation_v2 enable row level security;
revoke all on public.tool_pass_allowed_v2,public.tool_pass_orders_v2,public.tool_pass_operation_v2 from public,anon,authenticated;

create or replace function public.purchase_tool_pass_v2(
 p_user_id uuid,p_request_id uuid,p_sku text,p_currency text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 prev public.tool_pass_orders_v2%rowtype;
 amount_minor bigint;
 plan_days integer;
 t_start timestamptz;
 t_end timestamptz;
 charge jsonb;
begin
 if p_user_id is null or p_request_id is null or p_currency not in ('CNY','USD') then
  return jsonb_build_object('ok',false,'error','INVALID_PURCHASE');end if;
 case p_sku
  when 'tools_7d' then amount_minor:=2900; plan_days:=7;
  when 'tools_30d' then amount_minor:=9900;plan_days:=30;
  when 'tools_90d' then amount_minor:=26900;plan_days:=90;
  when 'tools_365d' then amount_minor:=89900;plan_days:=365;
  else return jsonb_build_object('ok',false,'error','INVALID_PLAN');
 end case;
 -- One account lock serializes purchases, overlap extension and refunds.
 perform pg_advisory_xact_lock(hashtextextended('toolpass-v2:'||p_user_id::text,0));
 select * into prev from public.tool_pass_orders_v2 where request_id=p_request_id for update;
 if found then
  if prev.user_id<>p_user_id or prev.currency<>p_currency or prev.sku<>p_sku then
   return jsonb_build_object('ok',false,'error','IDEMPOTENCY_CONFLICT');end if;
  return jsonb_build_object('ok',true,'alreadyPurchased',true,'requestId',prev.request_id,
   'sku',prev.sku,'currency',prev.currency,'startsAt',prev.starts_at,'endsAt',prev.ends_at,'state',prev.state);
 end if;
 select greatest(now(),coalesce(max(ends_at),now())) into t_start
  from public.tool_pass_orders_v2 where user_id=p_user_id and state='active' and ends_at>now();
 t_end:=t_start+make_interval(days=>plan_days);
 charge:=public.charge_sasi_usage_v49(
  p_user_id,p_currency,amount_minor,'toolpass-v2:'||p_request_id::text,
  'tool-pass-purchase',jsonb_build_object('sku',p_sku,'durationDays',plan_days)
 );
 if coalesce((charge->>'ok')::boolean,false) is not true then return charge;end if;
 -- An earlier charge without a matching purchase must not turn into a free
 -- entitlement. Normally impossible because this RPC is fully transactional.
 if coalesce((charge->>'alreadyCharged')::boolean,false) then
  return jsonb_build_object('ok',false,'error','ORPHANED_CHARGE_REFERENCE');
 end if;
 insert into public.tool_pass_orders_v2(request_id,user_id,sku,currency,amount_minor,starts_at,ends_at)
 values (p_request_id,p_user_id,p_sku,p_currency,amount_minor,t_start,t_end);
 return jsonb_build_object('ok',true,'alreadyPurchased',false,'requestId',p_request_id,
  'sku',p_sku,'currency',p_currency,'chargedMinor',amount_minor,'startsAt',t_start,'endsAt',t_end);
end $$;

create or replace function public.claim_tool_pass_use_v2(
 p_user_id uuid,p_operation_id uuid,p_tool_key text,p_ip_hash text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 previous public.tool_pass_operation_v2%rowtype;
 active_pass boolean;
 already_free boolean;
 decision text;
begin
 if p_user_id is null or p_operation_id is null or
    p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{64}$' then
  return jsonb_build_object('ok',false,'error','INVALID_OPERATION');
 end if;
 if not exists(select 1 from public.tool_pass_allowed_v2
               where tool_id=p_tool_key and enabled=true) then
  return jsonb_build_object('ok',false,'error','TOOL_NOT_COVERED');
 end if;
 -- Account lock first, IP lock second: stable order avoids deadlocks.
 perform pg_advisory_xact_lock(hashtextextended('toolpass-v2:'||p_user_id::text,0));
 perform pg_advisory_xact_lock(hashtextextended('toolpass-v2-ip:'||p_ip_hash||':'||p_tool_key,0));
 select * into previous from public.tool_pass_operation_v2
  where operation_id=p_operation_id for update;
 if found then
  if previous.user_id<>p_user_id or previous.tool_id<>p_tool_key or previous.ip_hash<>p_ip_hash then
   return jsonb_build_object('ok',false,'error','IDEMPOTENCY_CONFLICT');end if;
  return jsonb_build_object('ok',true,'alreadyClaimed',true,'access',previous.access_kind);
 end if;
 select exists(
  select 1 from public.tool_pass_orders_v2
  where user_id=p_user_id and state='active' and starts_at<=now() and ends_at>now()
 ) into active_pass;
 if active_pass then
  decision:='pass';
 else
  select exists(
   select 1 from public.tool_pass_operation_v2
   where tool_id=p_tool_key and access_kind='free'
     and (user_id=p_user_id or ip_hash=p_ip_hash)
  ) into already_free;
  if already_free then
   return jsonb_build_object('ok',false,'error','FREE_USED_PASS_REQUIRED');
  end if;
  decision:='free';
 end if;
 insert into public.tool_pass_operation_v2(operation_id,user_id,tool_id,ip_hash,access_kind)
  values(p_operation_id,p_user_id,p_tool_key,p_ip_hash,decision);
 return jsonb_build_object('ok',true,'alreadyClaimed',false,'access',decision);
end $$;

revoke all on function public.purchase_tool_pass_v2(uuid,uuid,text,text) from public,anon,authenticated;
revoke all on function public.claim_tool_pass_use_v2(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.purchase_tool_pass_v2(uuid,uuid,text,text) to service_role;
grant execute on function public.claim_tool_pass_use_v2(uuid,uuid,text,text) to service_role;
commit;
