begin;

create table if not exists public.sasi_compute_nodes (
  id uuid primary key default gen_random_uuid(),
  node_key text not null unique,
  display_name text not null default '',
  state text not null default 'offline' check (state in ('offline','starting','ready','degraded','busy','draining','unhealthy')),
  protocol_version text not null default '',
  capabilities jsonb not null default '[]'::jsonb,
  models jsonb not null default '{}'::jsonb,
  resources jsonb not null default '{}'::jsonb,
  last_heartbeat_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sasi_compute_nodes enable row level security;
revoke all on public.sasi_compute_nodes from anon, authenticated;
grant all on public.sasi_compute_nodes to service_role;

create table if not exists public.sasi_native_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid null references public.sasi_tasks(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid null references public.sasi_projects(id) on delete set null,
  worker_job_id text not null,
  kind text not null check (kind in ('reason','image','video')),
  model text not null,
  state text not null check (state in ('queued','running','succeeded','failed','cancelled')),
  artifacts jsonb not null default '[]'::jsonb,
  usage jsonb not null default '{}'::jsonb,
  error jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,worker_job_id)
);

alter table public.sasi_native_runs enable row level security;
drop policy if exists "sasi_native_runs_owner_read" on public.sasi_native_runs;
create policy "sasi_native_runs_owner_read" on public.sasi_native_runs
  for select to authenticated using (auth.uid()=user_id);
revoke insert,update,delete on public.sasi_native_runs from anon, authenticated;
grant all on public.sasi_native_runs to service_role;

commit;
