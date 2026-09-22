create table if not exists public.tool_pricing (
  tool_id text primary key,
  billing_type text not null check (billing_type in ('free','per_export','per_page','per_file','per_minute','per_image','ai_credit')),
  unit_name text not null default 'unit',
  base_price_rmb numeric(10,2) not null default 0,
  unit_price_rmb numeric(10,4) not null default 0,
  min_price_rmb numeric(10,2) not null default 0,
  max_price_rmb numeric(10,2),
  pricing_json jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.tool_payment_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null references public.tool_pricing(tool_id),
  billing_type text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_name text not null,
  amount_rmb numeric(10,2) not null check (amount_rmb >= 0),
  amount_usd numeric(10,2) not null check (amount_usd >= 0),
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'quoted' check (status in ('quoted','ordered','paid','expired','canceled')),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now()
);

create index if not exists tool_payment_quotes_user_created_idx
  on public.tool_payment_quotes(user_id, created_at desc);

create table if not exists public.tool_export_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id uuid not null unique references public.tool_payment_quotes(id) on delete cascade,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  tool_id text not null,
  quantity numeric(12,3) not null,
  unit_name text not null,
  amount_rmb numeric(10,2) not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tool_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  tool_id text not null,
  usage_type text not null,
  quantity numeric(12,3) not null default 1,
  credits_used numeric(12,3) not null default 0,
  order_id uuid references public.orders(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tool_pricing enable row level security;
alter table public.tool_payment_quotes enable row level security;
alter table public.tool_export_grants enable row level security;
alter table public.tool_usage_ledger enable row level security;

drop policy if exists "users read own tool quotes" on public.tool_payment_quotes;
create policy "users read own tool quotes"
on public.tool_payment_quotes for select
using (auth.uid() = user_id);

drop policy if exists "users read own tool grants" on public.tool_export_grants;
create policy "users read own tool grants"
on public.tool_export_grants for select
using (auth.uid() = user_id);

insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,enabled)
values
('pdf-editor','per_page','page',0,0,1.90,99.00,'{"tiers":[{"max":5,"price":1.9},{"max":20,"price":2.9},{"max":50,"price":4.9},{"max":100,"price":7.9},{"max":200,"price":12.9}],"after":200,"block":50,"blockPrice":3.0}'::jsonb,true),
('e-sign-pdf','per_page','page',0,0,1.90,99.00,'{"tiers":[{"max":5,"price":1.9},{"max":20,"price":2.9},{"max":50,"price":4.9},{"max":100,"price":7.9},{"max":200,"price":12.9}],"after":200,"block":50,"blockPrice":3.0}'::jsonb,true),
('cross-page-stamp','per_page','page',0,0,1.90,99.00,'{"tiers":[{"max":5,"price":1.9},{"max":20,"price":2.9},{"max":50,"price":4.9},{"max":100,"price":7.9},{"max":200,"price":12.9}],"after":200,"block":50,"blockPrice":3.0}'::jsonb,true),
('batch-image-watermark-remover','per_image','image',1.90,0.30,1.90,59.00,'{}'::jsonb,true),
('image-watermark-remover','per_image','image',0,1.90,1.90,19.00,'{}'::jsonb,true),
('video-dubbing','per_minute','minute',2.90,1.20,2.90,299.00,'{}'::jsonb,true),
('food-calorie','per_image','image',0,0.50,0.50,9.90,'{}'::jsonb,true)
on conflict(tool_id) do update set
 billing_type=excluded.billing_type,
 unit_name=excluded.unit_name,
 base_price_rmb=excluded.base_price_rmb,
 unit_price_rmb=excluded.unit_price_rmb,
 min_price_rmb=excluded.min_price_rmb,
 max_price_rmb=excluded.max_price_rmb,
 pricing_json=excluded.pricing_json,
 enabled=excluded.enabled,
 updated_at=now();

create or replace function public.fulfill_tool_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_quote public.tool_payment_quotes%rowtype;
  v_quote_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'ORDER_NOT_FOUND'); end if;

  if v_order.status = 'paid' then
    return jsonb_build_object('ok', true, 'alreadyPaid', true);
  end if;

  if v_order.product_id not like 'toolquote:%' then
    return jsonb_build_object('ok', false, 'error', 'NOT_TOOL_ORDER');
  end if;

  begin
    v_quote_id := substring(v_order.product_id from 11)::uuid;
  exception when others then
    return jsonb_build_object('ok', false, 'error', 'BAD_QUOTE_ID');
  end;

  select * into v_quote from public.tool_payment_quotes where id = v_quote_id for update;
  if not found or v_quote.user_id <> v_order.user_id then
    return jsonb_build_object('ok', false, 'error', 'QUOTE_NOT_FOUND');
  end if;

  if round(v_order.amount_rmb::numeric,2) <> round(v_quote.amount_rmb::numeric,2) then
    return jsonb_build_object('ok', false, 'error', 'AMOUNT_MISMATCH');
  end if;

  update public.orders set status='paid' where id=p_order_id;
  update public.tool_payment_quotes set status='paid' where id=v_quote.id;

  insert into public.tool_export_grants(user_id,quote_id,order_id,tool_id,quantity,unit_name,amount_rmb)
  values(v_order.user_id,v_quote.id,p_order_id,v_quote.tool_id,v_quote.quantity,v_quote.unit_name,v_quote.amount_rmb)
  on conflict(quote_id) do nothing;

  insert into public.tool_usage_ledger(user_id,tool_id,usage_type,quantity,credits_used,order_id,metadata)
  values(v_order.user_id,v_quote.tool_id,'paid_export',v_quote.quantity,0,p_order_id,jsonb_build_object('quote_id',v_quote.id));

  return jsonb_build_object('ok', true);
end
$$;
