-- User-requested independent CNY/USD price books: every exported document page.
-- Existing paid quotes are left intact; no payment or order is created here.
insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,enabled)
values ('pdf-redact','per_page','page',0,1,1,null,'{}'::jsonb,0,1,1,null,'{}'::jsonb,true)
on conflict(tool_id) do update set
billing_type=excluded.billing_type,unit_name=excluded.unit_name,
base_price_rmb=excluded.base_price_rmb,unit_price_rmb=excluded.unit_price_rmb,min_price_rmb=excluded.min_price_rmb,max_price_rmb=excluded.max_price_rmb,pricing_json=excluded.pricing_json,
base_price_usd=excluded.base_price_usd,unit_price_usd=excluded.unit_price_usd,min_price_usd=excluded.min_price_usd,max_price_usd=excluded.max_price_usd,pricing_json_usd=excluded.pricing_json_usd,
enabled=excluded.enabled,updated_at=now();
