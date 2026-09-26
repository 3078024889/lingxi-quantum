begin;

-- V15.81: latest confirmed food-calorie price book.
update public.tool_pricing
set
  billing_type = 'per_image',
  unit_name = 'image',
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

-- There is no standalone public cross-page-stamp surface.
-- The current user flow is part of e-sign-pdf, so keep the orphan price row disabled
-- rather than allowing quotes for a tool users cannot independently open.
update public.tool_pricing
set enabled = false, updated_at = now()
where tool_id = 'cross-page-stamp';

commit;
