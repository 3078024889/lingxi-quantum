-- Separate supplier-paid tasks from the SASI wallet ledger. A quote ID is also
-- the durable idempotency boundary. Clients cannot insert or update rows.
create table public.sasi_byok_video_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.sasi_projects(id) on delete cascade,
  provider text not null default 'volcengine' check (provider = 'volcengine'),
  state text not null default 'quoted' check (state in ('quoted','submitting','uncertain','queued','running','succeeded','failed')),
  request jsonb not null,
  profile_version text not null,
  memory_version text not null,
  key_fingerprint text not null,
  estimated_fen bigint not null check (estimated_fen > 0),
  price_source text not null,
  expires_at timestamptz not null,
  approved_at timestamptz,
  provider_task_id text,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sasi_byok_video_owner_project on public.sasi_byok_video_tasks(user_id, project_id, created_at desc);
create unique index sasi_byok_video_supplier_task on public.sasi_byok_video_tasks(provider,provider_task_id) where provider_task_id is not null;
alter table public.sasi_byok_video_tasks enable row level security;
revoke all on public.sasi_byok_video_tasks from anon, authenticated;
grant select on public.sasi_byok_video_tasks to authenticated;
grant all on public.sasi_byok_video_tasks to service_role;
create policy "owner reads own byok videos" on public.sasi_byok_video_tasks for select to authenticated using ((select auth.uid()) = user_id);
