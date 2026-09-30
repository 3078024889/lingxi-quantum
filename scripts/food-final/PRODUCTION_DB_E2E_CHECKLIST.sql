-- Read-only checks after migrations are deliberately applied.
select indexname,indexdef from pg_indexes where schemaname='public' and tablename='food_calorie_daily_free_usage';
select routine_name,security_type from information_schema.routines where routine_schema='public' and routine_name like '%food%v1%';
select count(*) as localized_rows,
 count(*) filter(where verified) as verified_rows
from public.nutrition_food_i18n_v17;
select count(*) as active_sessions from public.food_calorie_image_sessions_v17 where expires_at>now() and consumed_at is null;
-- Expected application E2E cases:
-- anonymous IP A free once; anonymous IP B free once; same IP second attempt denied;
-- calculation failure leaves free entitlement available;
-- account free once across IP changes;
-- quote quantity 1 + photo_count 2 denied;
-- paid quote cannot replay with changed input/session;
-- same exact paid request is idempotent;
-- CNY quantity 3 = ¥9; USD quantity 3 = $9; no FX conversion;
