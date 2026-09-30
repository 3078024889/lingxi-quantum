begin;
create table if not exists public.sasi_runtime_events(
 event_id uuid primary key default gen_random_uuid(), owner_id uuid not null, project_id uuid, task_id uuid,
 event_kind text not null, payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists sasi_runtime_events_owner_project_created_idx on public.sasi_runtime_events(owner_id,project_id,created_at desc);
create table if not exists public.sasi_provider_health(
 owner_id uuid not null, provider_id text not null, health numeric not null default 1 check(health>=0 and health<=1),
 latency_ms numeric not null default 0 check(latency_ms>=0), samples bigint not null default 0 check(samples>=0),
 updated_at timestamptz not null default now(), primary key(owner_id,provider_id)
);
create table if not exists public.sasi_living_site_revisions(
 revision_id uuid primary key default gen_random_uuid(), owner_id uuid not null, project_id uuid not null,
 revision bigint not null check(revision>0), site_dna jsonb not null default '{}'::jsonb,
 validation jsonb not null default '{}'::jsonb, artifacts jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(), unique(owner_id,project_id,revision)
);
alter table public.sasi_runtime_events enable row level security;
alter table public.sasi_provider_health enable row level security;
alter table public.sasi_living_site_revisions enable row level security;
drop policy if exists sasi_runtime_events_owner on public.sasi_runtime_events;
create policy sasi_runtime_events_owner on public.sasi_runtime_events for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
drop policy if exists sasi_provider_health_owner on public.sasi_provider_health;
create policy sasi_provider_health_owner on public.sasi_provider_health for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
drop policy if exists sasi_living_site_revisions_owner on public.sasi_living_site_revisions;
create policy sasi_living_site_revisions_owner on public.sasi_living_site_revisions for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
