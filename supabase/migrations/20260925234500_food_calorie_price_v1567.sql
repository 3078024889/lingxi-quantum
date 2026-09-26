begin;

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
