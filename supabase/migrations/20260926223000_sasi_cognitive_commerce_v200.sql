begin;

alter table public.tool_pricing drop constraint if exists tool_pricing_billing_type_check;
alter table public.tool_pricing add constraint tool_pricing_billing_type_check
check (billing_type = any (array[
  'free'::text,'per_export'::text,'per_page'::text,'per_file'::text,
  'per_minute'::text,'per_second'::text,'per_image'::text,'per_email'::text,'ai_credit'::text
]));

insert into public.tool_pricing(
  tool_id,billing_type,unit_name,
  base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,
  base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,
  enabled,updated_at
) values
  ('sasi-deep-reason','per_export','calculation',0,0.50,0.50,null,'{}'::jsonb,0,0.10,0.10,null,'{}'::jsonb,true,now()),
  ('sasi-image-generate','per_image','image',0,1.00,1.00,null,'{}'::jsonb,0,0.20,0.20,null,'{}'::jsonb,true,now()),
  ('sasi-video-generate','per_second','second',0,1.00,5.00,null,'{}'::jsonb,0,0.20,1.00,null,'{}'::jsonb,true,now())
on conflict (tool_id) do update set
  billing_type=excluded.billing_type,
  unit_name=excluded.unit_name,
  base_price_rmb=excluded.base_price_rmb,
  unit_price_rmb=excluded.unit_price_rmb,
  min_price_rmb=excluded.min_price_rmb,
  max_price_rmb=excluded.max_price_rmb,
  pricing_json=excluded.pricing_json,
  base_price_usd=excluded.base_price_usd,
  unit_price_usd=excluded.unit_price_usd,
  min_price_usd=excluded.min_price_usd,
  max_price_usd=excluded.max_price_usd,
  pricing_json_usd=excluded.pricing_json_usd,
  enabled=excluded.enabled,
  updated_at=now();

create table if not exists public.sasi_native_entitlements(
  quote_id uuid primary key references public.tool_payment_quotes(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check(kind in ('reason','image','video')),
  worker_job_id text null,
  state text not null default 'reserved' check(state in ('reserved','submitted','completed','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sasi_native_entitlements_user_created_idx
  on public.sasi_native_entitlements(user_id,created_at desc);

alter table public.sasi_native_entitlements enable row level security;
revoke all on public.sasi_native_entitlements from anon,authenticated;
grant all on public.sasi_native_entitlements to service_role;

commit;
