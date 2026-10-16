-- Restore the existing published price from 20261001165000_media_production_pricing_v19.
-- The production row was absent. Preserve any existing administrative override.
-- Runtime provider readiness remains mandatory before quoting or starting a task.
insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,base_price_usd,unit_price_usd,min_price_usd,max_price_usd,pricing_json_usd,enabled)
values ('image-translator','per_image','image',0,0.99,0.99,99.00,'{}'::jsonb,0,0.29,0.29,29.00,'{}'::jsonb,true)
on conflict(tool_id) do nothing;
