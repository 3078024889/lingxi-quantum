create table public.sasi_byok_text_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state text not null default 'quoted' check (state in ('quoted','running','succeeded','failed','uncertain')),
  request jsonb not null,
  profile_version text not null,
  key_fingerprint text not null,
  estimated_fen integer not null check (estimated_fen > 0),
  expires_at timestamptz not null,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sasi_byok_text_owner on public.sasi_byok_text_tasks(user_id,created_at desc);
alter table public.sasi_byok_text_tasks enable row level security;
revoke all on public.sasi_byok_text_tasks from anon, authenticated;
grant select on public.sasi_byok_text_tasks to authenticated;
grant all on public.sasi_byok_text_tasks to service_role;
create policy "owner reads own byok text" on public.sasi_byok_text_tasks for select to authenticated using ((select auth.uid()) = user_id);
