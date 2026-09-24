begin;

alter table public.tool_pricing add column if not exists base_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists unit_price_usd numeric(10,4);
alter table public.tool_pricing add column if not exists min_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists max_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists pricing_json_usd jsonb not null default '{}'::jsonb;

update public.tool_pricing set
 base_price_usd=case tool_id when 'batch-image-watermark-remover' then 1.49 when 'video-dubbing' then 1.49 else 0 end,
 unit_price_usd=case tool_id
  when 'audio-transcription' then 0.65
  when 'batch-image-watermark-remover' then 0.55
  when 'food-calorie' then 0.50
  when 'id-photo-ai' then 1.49
  when 'image-watermark-remover' then 1.49
  when 'subtitle-translate' then 1.49
  when 'video-dubbing' then 0.79
  when 'video-transcription' then 0.69
  when 'video-watermark-remover' then 0.69
  else 0 end,
 min_price_usd=case when tool_id in(
  'audio-transcription','batch-image-watermark-remover','cross-page-stamp','e-sign-pdf','food-calorie',
  'id-photo-ai','image-watermark-remover','pdf-editor','subtitle-translate','video-dubbing',
  'video-transcription','video-watermark-remover') then 1.49 else min_price_usd end,
 max_price_usd=max_price_rmb,
 pricing_json_usd=case when tool_id in('cross-page-stamp','e-sign-pdf','pdf-editor')
  then '{"tiers":[{"max":10000,"price":1.49}]}'::jsonb else '{}'::jsonb end
where tool_id in(
 'audio-transcription','batch-image-watermark-remover','cross-page-stamp','e-sign-pdf','food-calorie',
 'id-photo-ai','image-watermark-remover','pdf-editor','subtitle-translate','video-dubbing',
 'video-transcription','video-watermark-remover'
);

insert into public.tool_pricing(
 tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,
 base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,enabled,updated_at
) values(
 'temp-mail-batch','per_image','email',0,.05,.55,5,'{}',0,.05,.55,5,'{}',true,now()
)
on conflict(tool_id) do update set
 unit_price_rmb=.05,min_price_rmb=.55,max_price_rmb=5,
 base_price_usd=0,unit_price_usd=.05,min_price_usd=.55,max_price_usd=5,
 pricing_json_usd='{}'::jsonb,enabled=true,updated_at=now();

insert into public.tool_pricing(
 tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,
 base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,enabled,updated_at
) values(
 'burn-after-read-file','per_file','mb',0,0,.9,12.9,
 '{"tiers":[{"max":10,"price":0.9},{"max":50,"price":1.9},{"max":200,"price":3.9},{"max":500,"price":6.9},{"max":1000000,"price":12.9}]}'::jsonb,
 0,0,.9,12.9,
 '{"tiers":[{"max":10,"price":0.9},{"max":50,"price":1.9},{"max":200,"price":3.9},{"max":500,"price":6.9},{"max":1000000,"price":12.9}]}'::jsonb,
 false,now()
)
on conflict(tool_id) do update set
 pricing_json=excluded.pricing_json,base_price_usd=excluded.base_price_usd,unit_price_usd=excluded.unit_price_usd,
 min_price_usd=excluded.min_price_usd,max_price_usd=excluded.max_price_usd,pricing_json_usd=excluded.pricing_json_usd,
 enabled=false,updated_at=now();

create table if not exists public.ai_usd_wallets(
 user_id uuid primary key references auth.users(id) on delete cascade,
 available_cents bigint not null default 0 check(available_cents>=0),
 refundable_cents bigint not null default 0 check(refundable_cents>=0),
 lifetime_topup_cents bigint not null default 0 check(lifetime_topup_cents>=0),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.ai_usd_wallet_ledger(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null,delta_cents bigint not null default 0,available_after_cents bigint not null default 0,
 reference_id text,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now()
);
create unique index if not exists ai_usd_wallet_topup_uidx on public.ai_usd_wallet_ledger(reference_id) where kind='topup' and reference_id is not null;

create table if not exists public.sasi_usd_wallets(
 user_id uuid primary key references auth.users(id) on delete cascade,
 available_cents bigint not null default 0 check(available_cents>=0),
 reserved_cents bigint not null default 0 check(reserved_cents>=0),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.sasi_usd_wallet_ledger(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null,delta_available_cents bigint not null default 0,delta_reserved_cents bigint not null default 0,
 available_after_cents bigint not null default 0,reserved_after_cents bigint not null default 0,
 reference_id text,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now()
);
create unique index if not exists sasi_usd_wallet_topup_uidx on public.sasi_usd_wallet_ledger(reference_id) where kind='topup' and reference_id is not null;

alter table public.ai_usd_wallets enable row level security;
alter table public.ai_usd_wallet_ledger enable row level security;
alter table public.sasi_usd_wallets enable row level security;
alter table public.sasi_usd_wallet_ledger enable row level security;

drop policy if exists "own ai usd wallet read" on public.ai_usd_wallets;
create policy "own ai usd wallet read" on public.ai_usd_wallets for select to authenticated using((select auth.uid())=user_id);
drop policy if exists "own ai usd ledger read" on public.ai_usd_wallet_ledger;
create policy "own ai usd ledger read" on public.ai_usd_wallet_ledger for select to authenticated using((select auth.uid())=user_id);
drop policy if exists "own sasi usd wallet read" on public.sasi_usd_wallets;
create policy "own sasi usd wallet read" on public.sasi_usd_wallets for select to authenticated using((select auth.uid())=user_id);
drop policy if exists "own sasi usd ledger read" on public.sasi_usd_wallet_ledger;
create policy "own sasi usd ledger read" on public.sasi_usd_wallet_ledger for select to authenticated using((select auth.uid())=user_id);

revoke all on public.ai_usd_wallets,public.ai_usd_wallet_ledger,public.sasi_usd_wallets,public.sasi_usd_wallet_ledger from anon;
revoke insert,update,delete on public.ai_usd_wallets,public.ai_usd_wallet_ledger,public.sasi_usd_wallets,public.sasi_usd_wallet_ledger from authenticated;
grant select on public.ai_usd_wallets,public.ai_usd_wallet_ledger,public.sasi_usd_wallets,public.sasi_usd_wallet_ledger to authenticated;
grant all on public.ai_usd_wallets,public.ai_usd_wallet_ledger,public.sasi_usd_wallets,public.sasi_usd_wallet_ledger to service_role;

create or replace function public.ai_usd_wallet_snapshot(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v public.ai_usd_wallets%rowtype;
begin
 insert into public.ai_usd_wallets(user_id) values(p_user_id) on conflict do nothing;
 select * into v from public.ai_usd_wallets where user_id=p_user_id;
 return jsonb_build_object('available_cents',v.available_cents,'refundable_cents',v.refundable_cents,'lifetime_topup_cents',v.lifetime_topup_cents);
end $$;

create or replace function public.credit_ai_usd_topup(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.orders%rowtype;amount_cents bigint;expected_usd numeric;v public.ai_usd_wallets%rowtype;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then return jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); end if;
 if o.provider<>'paypal' then return jsonb_build_object('ok',false,'error','USD_REQUIRES_PAYPAL'); end if;
 if o.product_id !~ '^ai-usd-balance-(10|20|50|100|300|500|1000|2000|10000)$' then return jsonb_build_object('ok',false,'error','INVALID_USD_TOPUP'); end if;
 expected_usd:=substring(o.product_id from '([0-9]+)$')::numeric;amount_cents:=(expected_usd*100)::bigint;
 if round(o.amount_usd,2)<>round(expected_usd,2) then return jsonb_build_object('ok',false,'error','AMOUNT_MISMATCH'); end if;
 if exists(select 1 from public.ai_usd_wallet_ledger where kind='topup' and reference_id=p_order_id::text) then
  update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;return jsonb_build_object('ok',true,'alreadyPaid',true);
 end if;
 insert into public.ai_usd_wallets(user_id) values(o.user_id) on conflict do nothing;
 update public.ai_usd_wallets set available_cents=available_cents+amount_cents,refundable_cents=refundable_cents+amount_cents,lifetime_topup_cents=lifetime_topup_cents+amount_cents,updated_at=now() where user_id=o.user_id returning * into v;
 insert into public.ai_usd_wallet_ledger(user_id,kind,delta_cents,available_after_cents,reference_id,metadata)
 values(o.user_id,'topup',amount_cents,v.available_cents,p_order_id::text,jsonb_build_object('provider','paypal','currency','USD','productId',o.product_id));
 update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;
 return jsonb_build_object('ok',true,'amountCents',amount_cents,'availableCents',v.available_cents);
end $$;

create or replace function public.credit_sasi_usd_topup(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.orders%rowtype;amount_cents bigint;expected_usd numeric;v public.sasi_usd_wallets%rowtype;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then return jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); end if;
 if o.provider<>'paypal' then return jsonb_build_object('ok',false,'error','USD_REQUIRES_PAYPAL'); end if;
 if o.product_id !~ '^sasi-usd-balance-(10|20|50|100|300|500|1000|2000|10000)$' then return jsonb_build_object('ok',false,'error','INVALID_USD_TOPUP'); end if;
 expected_usd:=substring(o.product_id from '([0-9]+)$')::numeric;amount_cents:=(expected_usd*100)::bigint;
 if round(o.amount_usd,2)<>round(expected_usd,2) then return jsonb_build_object('ok',false,'error','AMOUNT_MISMATCH'); end if;
 if exists(select 1 from public.sasi_usd_wallet_ledger where kind='topup' and reference_id=p_order_id::text) then
  update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;return jsonb_build_object('ok',true,'alreadyPaid',true);
 end if;
 insert into public.sasi_usd_wallets(user_id) values(o.user_id) on conflict do nothing;
 update public.sasi_usd_wallets set available_cents=available_cents+amount_cents,updated_at=now() where user_id=o.user_id returning * into v;
 insert into public.sasi_usd_wallet_ledger(user_id,kind,delta_available_cents,available_after_cents,reserved_after_cents,reference_id,metadata)
 values(o.user_id,'topup',amount_cents,v.available_cents,v.reserved_cents,p_order_id::text,jsonb_build_object('provider','paypal','currency','USD','productId',o.product_id));
 update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;
 return jsonb_build_object('ok',true,'amountCents',amount_cents,'availableCents',v.available_cents);
end $$;

revoke all on function public.ai_usd_wallet_snapshot(uuid) from public,anon,authenticated;
revoke all on function public.credit_ai_usd_topup(uuid) from public,anon,authenticated;
revoke all on function public.credit_sasi_usd_topup(uuid) from public,anon,authenticated;
grant execute on function public.ai_usd_wallet_snapshot(uuid) to service_role;
grant execute on function public.credit_ai_usd_topup(uuid) to service_role;
grant execute on function public.credit_sasi_usd_topup(uuid) to service_role;

commit;
