-- SASI Platform Kernel v18.0
-- Durable task lifecycle + node/event/artifact/capability run stores.
-- Service-role performs writes; authenticated users can read their own records.

begin;

create table if not exists public.sasi_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid null references public.sasi_projects(id) on delete cascade,
  kind text not null,
  action text not null,
  intent jsonb not null default '{}'::jsonb,
  input jsonb not null default '{}'::jsonb,
  constraints jsonb not null default '{}'::jsonb,
  plan jsonb not null default '{}'::jsonb,
  execution_graph jsonb not null default '{}'::jsonb,
  state text not null default 'created' check (state in ('created','planning','queued','running','validating','succeeded','failed','cancelled')),
  progress numeric not null default 0 check (progress between 0 and 1),
  result jsonb null,
  error jsonb null,
  retry_count integer not null default 0 check (retry_count >= 0),
  memory_reads jsonb not null default '[]'::jsonb,
  memory_writes jsonb not null default '[]'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  cost jsonb not null default '{}'::jsonb,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sasi_tasks_user_created_idx on public.sasi_tasks(user_id, created_at desc);
create index if not exists sasi_tasks_project_created_idx on public.sasi_tasks(project_id, created_at desc) where project_id is not null;
create index if not exists sasi_tasks_state_idx on public.sasi_tasks(state, updated_at desc);

create table if not exists public.sasi_task_nodes (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.sasi_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  node_id text not null,
  capability_id text not null,
  state text not null default 'queued' check (state in ('queued','running','validating','succeeded','failed','cancelled','skipped')),
  depends_on text[] not null default '{}',
  attempt integer not null default 0 check (attempt >= 0),
  max_retries integer not null default 0 check (max_retries between 0 and 10),
  runtime_target text null,
  worker_id text null,
  input jsonb not null default '{}'::jsonb,
  output jsonb null,
  error jsonb null,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(task_id,node_id)
);
create index if not exists sasi_task_nodes_task_idx on public.sasi_task_nodes(task_id, created_at);
create index if not exists sasi_task_nodes_state_idx on public.sasi_task_nodes(state, updated_at desc);

create table if not exists public.sasi_task_events (
  id bigserial primary key,
  task_id uuid not null references public.sasi_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_index integer not null check (event_index >= 0),
  event_type text not null,
  node_id text null,
  attempt integer null,
  data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  unique(task_id,event_index)
);
create index if not exists sasi_task_events_task_idx on public.sasi_task_events(task_id,event_index);

create table if not exists public.sasi_artifacts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.sasi_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid null references public.sasi_projects(id) on delete cascade,
  node_id text null,
  kind text not null check (kind in ('text','json','file','video','image','audio','archive')),
  name text not null,
  mime_type text null,
  inline_value jsonb null,
  storage_path text null,
  sha256 text null check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  byte_size bigint null check (byte_size is null or byte_size >= 0),
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  check (inline_value is not null or storage_path is not null)
);
create index if not exists sasi_artifacts_task_idx on public.sasi_artifacts(task_id,created_at);
create index if not exists sasi_artifacts_user_idx on public.sasi_artifacts(user_id,created_at desc);

create table if not exists public.sasi_capability_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.sasi_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  node_id text not null,
  capability_id text not null,
  capability_version text not null,
  execution_class text not null,
  runtime_target text not null,
  backend text null,
  model text null,
  state text not null check (state in ('queued','running','succeeded','failed','cancelled')),
  attempt integer not null default 1 check (attempt > 0),
  usage jsonb not null default '{}'::jsonb,
  timings jsonb not null default '{}'::jsonb,
  error jsonb null,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now()
);
create index if not exists sasi_capability_runs_task_idx on public.sasi_capability_runs(task_id,created_at);

alter table public.sasi_tasks enable row level security;
alter table public.sasi_task_nodes enable row level security;
alter table public.sasi_task_events enable row level security;
alter table public.sasi_artifacts enable row level security;
alter table public.sasi_capability_runs enable row level security;

revoke insert, update, delete on public.sasi_tasks from anon, authenticated;
revoke insert, update, delete on public.sasi_task_nodes from anon, authenticated;
revoke insert, update, delete on public.sasi_task_events from anon, authenticated;
revoke insert, update, delete on public.sasi_artifacts from anon, authenticated;
revoke insert, update, delete on public.sasi_capability_runs from anon, authenticated;

grant select on public.sasi_tasks, public.sasi_task_nodes, public.sasi_task_events, public.sasi_artifacts, public.sasi_capability_runs to authenticated;
grant all on public.sasi_tasks, public.sasi_task_nodes, public.sasi_task_events, public.sasi_artifacts, public.sasi_capability_runs to service_role;
grant usage, select on sequence public.sasi_task_events_id_seq to service_role;

drop policy if exists "own sasi tasks read" on public.sasi_tasks;
create policy "own sasi tasks read" on public.sasi_tasks for select to authenticated using (auth.uid() = user_id);
drop policy if exists "own sasi task nodes read" on public.sasi_task_nodes;
create policy "own sasi task nodes read" on public.sasi_task_nodes for select to authenticated using (auth.uid() = user_id);
drop policy if exists "own sasi task events read" on public.sasi_task_events;
create policy "own sasi task events read" on public.sasi_task_events for select to authenticated using (auth.uid() = user_id);
drop policy if exists "own sasi artifacts read" on public.sasi_artifacts;
create policy "own sasi artifacts read" on public.sasi_artifacts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "own sasi capability runs read" on public.sasi_capability_runs;
create policy "own sasi capability runs read" on public.sasi_capability_runs for select to authenticated using (auth.uid() = user_id);

commit;
