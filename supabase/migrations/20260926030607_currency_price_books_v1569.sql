begin;

alter table public.profiles
  add column if not exists preferred_currency text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_preferred_currency_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_preferred_currency_check
      check (preferred_currency is null or preferred_currency in ('CNY','USD'));
  end if;
end $$;

alter table public.orders
  add column if not exists currency text;

update public.orders
set currency = case
  when provider = 'paypal' then 'USD'
  when provider in ('wechat','alipay') then 'CNY'
  else currency
end
where currency is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_currency_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_currency_check
      check (currency is null or currency in ('CNY','USD'));
  end if;
end $$;

alter table public.tool_payment_quotes
  add column if not exists currency text;

update public.tool_payment_quotes
set currency = case
  when upper(coalesce(metadata->>'pricing_currency','')) in ('CNY','USD')
    then upper(metadata->>'pricing_currency')
  when lower(coalesce(metadata->>'pricing_market','')) = 'cny'
    then 'CNY'
  when lower(coalesce(metadata->>'pricing_market','')) = 'usd'
    then 'USD'
  else currency
end
where currency is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'tool_payment_quotes_currency_check'
      and conrelid = 'public.tool_payment_quotes'::regclass
  ) then
    alter table public.tool_payment_quotes
      add constraint tool_payment_quotes_currency_check
      check (currency is null or currency in ('CNY','USD'));
  end if;
end $$;

update public.tool_pricing
set
  base_price_rmb = 0,
  unit_price_rmb = 1.00,
  min_price_rmb = 1.00,
  max_price_rmb = 10.00,
  base_price_usd = 0,
  unit_price_usd = 0.50,
  min_price_usd = 0.50,
  max_price_usd = 5.00,
  pricing_json = '{}'::jsonb,
  pricing_json_usd = '{}'::jsonb,
  enabled = true,
  updated_at = now()
where tool_id = 'food-calorie';

commit;
