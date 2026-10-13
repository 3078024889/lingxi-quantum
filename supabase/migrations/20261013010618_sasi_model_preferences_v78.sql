-- Separate per-capability choices without changing credentials or existing model IDs.
alter table public.sasi_provider_connections add column if not exists model_preferences jsonb not null default '{}'::jsonb;
alter table public.sasi_provider_connections add constraint sasi_model_preferences_v78_check check (
  jsonb_typeof(model_preferences) = 'object' and octet_length(model_preferences::text) <= 1024
  and (model_preferences - 'text' - 'video') = '{}'::jsonb
  and (not model_preferences ? 'text' or (jsonb_typeof(model_preferences->'text') = 'string' and length(model_preferences->>'text') <= 180))
  and (not model_preferences ? 'video' or (jsonb_typeof(model_preferences->'video') = 'string' and length(model_preferences->>'video') <= 180))
);
