begin;

create or replace function public.usd_cents_for_rmb_fen(p_fen bigint)
returns bigint
language sql
immutable
strict
set search_path=pg_catalog
as $$
  select case when p_fen <= 0 then 0 else ((p_fen + 1) / 2)::bigint end
$$;

create table if not exists public.sasi_user_skills(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  source_file_name text,
  content text not null,
  sha256 text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(char_length(name) between 1 and 120),
  check(char_length(description) <= 500),
  check(char_length(content) between 1 and 200000),
  check(sha256 ~ '^[0-9a-f]{64}$')
);

create unique index if not exists sasi_user_skills_user_sha256_uidx
  on public.sasi_user_skills(user_id,sha256);

create index if not exists sasi_user_skills_user_updated_idx
  on public.sasi_user_skills(user_id,updated_at desc);

alter table public.sasi_user_skills enable row level security;

revoke all on public.sasi_user_skills from public,anon,authenticated;
grant select,insert,update,delete on public.sasi_user_skills to service_role;

commit;
