begin;

create table if not exists public.tool_temp_files(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_key text not null unique,
  file_name text not null,
  mime_type text not null,
  byte_size bigint not null check(byte_size>0 and byte_size<=104857600),
  expires_at timestamptz not null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now()
);
create index if not exists tool_temp_files_expiry_idx on public.tool_temp_files(expires_at) where deleted_at is null;
alter table public.tool_temp_files enable row level security;
revoke all on public.tool_temp_files from anon,authenticated;
grant all on public.tool_temp_files to service_role;

-- Nutrition data is server-owned. Browser clients must use bounded application APIs.
revoke all on function public.search_food_nutrition_v2(text,integer) from public,anon,authenticated;
revoke all on function public.search_food_nutrition_v3(text[],integer) from public,anon,authenticated;
revoke all on function public.calculate_food_nutrition_v2(jsonb) from public,anon,authenticated;
grant execute on function public.search_food_nutrition_v2(text,integer) to service_role;
grant execute on function public.search_food_nutrition_v3(text[],integer) to service_role;
grant execute on function public.calculate_food_nutrition_v2(jsonb) to service_role;

-- Keep pg_trgm outside the exposed public schema.
create schema if not exists extensions;
alter extension pg_trgm set schema extensions;
alter function public.search_food_nutrition_v2(text,integer) set search_path=public,extensions;
alter function public.search_food_nutrition_v3(text[],integer) set search_path=public,extensions;

create index if not exists sasi_native_entitlements_state_idx on public.sasi_native_entitlements(state,updated_at);

commit;
