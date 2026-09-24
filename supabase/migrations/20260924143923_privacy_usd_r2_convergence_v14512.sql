-- Production convergence record. Already applied to production.
begin;

delete from public.tool_pricing where tool_id='temp-mail-day-pass';

alter table public.tool_pricing add column if not exists base_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists unit_price_usd numeric(10,4);
alter table public.tool_pricing add column if not exists min_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists max_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists pricing_json_usd jsonb not null default '{}'::jsonb;

update public.tool_pricing
set billing_type='per_email',unit_name='email',
    base_price_rmb=0,unit_price_rmb=.05,min_price_rmb=.55,max_price_rmb=5,
    base_price_usd=0,unit_price_usd=.05,min_price_usd=.55,max_price_usd=5,
    pricing_json='{}'::jsonb,pricing_json_usd='{}'::jsonb,enabled=true,updated_at=now()
where tool_id='temp-mail-batch';

update public.tool_pricing
set billing_type='per_file',unit_name='mb',
    base_price_rmb=0,unit_price_rmb=0,min_price_rmb=.9,max_price_rmb=12.9,
    pricing_json='{"tiers":[{"max":10,"price":0.9},{"max":50,"price":1.9},{"max":200,"price":3.9},{"max":500,"price":6.9},{"max":2048,"price":12.9}]}'::jsonb,
    base_price_usd=0,unit_price_usd=0,min_price_usd=.9,max_price_usd=12.9,
    pricing_json_usd='{"tiers":[{"max":10,"price":0.9},{"max":50,"price":1.9},{"max":200,"price":3.9},{"max":500,"price":6.9},{"max":2048,"price":12.9}]}'::jsonb,
    enabled=true,updated_at=now()
where tool_id='burn-after-read-file';

commit;
