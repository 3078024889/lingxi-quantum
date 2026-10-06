-- Versioned roots are separate from task artifacts; preserve the legacy task/file constraints.
begin;
create table if not exists public.sasi_versioned_artifacts(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null,
 project_id uuid,
 kind text not null,
 title text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.sasi_versioned_artifacts enable row level security;
revoke all on public.sasi_versioned_artifacts from anon,authenticated;

create table if not exists public.sasi_artifact_versions(
 id uuid primary key default gen_random_uuid(),
 artifact_id uuid not null references public.sasi_versioned_artifacts(id) on delete cascade,
 parent_version_id uuid references public.sasi_artifact_versions(id) on delete set null,
 run_id uuid,
 turn_id uuid,
 content_ref text not null,
 checksum text not null,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 unique(artifact_id,checksum)
);
alter table public.sasi_artifact_versions enable row level security;
revoke all on public.sasi_artifact_versions from anon,authenticated;
create index if not exists sasi_artifact_versions_artifact_idx on public.sasi_artifact_versions(artifact_id,created_at desc);

create table if not exists public.sasi_run_controls(
 id uuid primary key default gen_random_uuid(),
 run_id uuid not null,
 user_id uuid not null,
 action text not null check(action in('pause','resume','cancel','approve','reject')),
 idempotency_key text not null,
 reason text,
 created_at timestamptz not null default now(),
 unique(user_id,idempotency_key)
);
alter table public.sasi_run_controls enable row level security;
revoke all on public.sasi_run_controls from anon,authenticated;
commit;
