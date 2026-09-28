-- SASI V5.1 completion: project DNA, approved assets, visual validation and controlled experiments.
-- Additive only. Apply after 20260928170000_sasi_v5_quality_learning_foundation.sql.
begin;

create table if not exists public.sasi_v5_project_dna(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 project_id uuid not null references public.sasi_projects(id) on delete cascade,
 version integer not null check(version>0),
 status text not null check(status in ('draft','approved','superseded')),
 characters jsonb not null default '[]'::jsonb,
 style jsonb not null default '{}'::jsonb,
 approved_at timestamptz null,
 created_at timestamptz not null default now(),
 unique(project_id,version)
);
create index if not exists sasi_v5_project_dna_owner_idx on public.sasi_v5_project_dna(user_id,project_id,version desc);

create table if not exists public.sasi_v5_approved_assets(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 project_id uuid not null references public.sasi_projects(id) on delete cascade,
 asset_type text not null check(asset_type in ('character','scene','brand','product','voice','logo','reference','other')),
 label text not null,
 version integer not null check(version>0),
 status text not null check(status in ('draft','approved','superseded')),
 artifact_id uuid null references public.sasi_artifacts(id) on delete set null,
 asset_id uuid null references public.sasi_assets(id) on delete set null,
 external_ref text null,
 metadata jsonb not null default '{}'::jsonb,
 approved_at timestamptz null,
 created_at timestamptz not null default now(),
 unique(project_id,asset_type,label,version),
 check(artifact_id is not null or asset_id is not null or external_ref is not null)
);
create index if not exists sasi_v5_assets_owner_idx on public.sasi_v5_approved_assets(user_id,project_id,asset_type,label,version desc);

create table if not exists public.sasi_v5_visual_validations(
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 project_id uuid null references public.sasi_projects(id) on delete set null,
 task_id uuid null references public.sasi_tasks(id) on delete set null,
 kind text not null check(kind in ('image','video')),
 quality_tier text not null check(quality_tier in ('fast','standard','premium')),
 passed boolean not null,
 quality jsonb not null default '{}'::jsonb,
 reasons jsonb not null default '[]'::jsonb,
 technical jsonb not null default '{}'::jsonb,
 semantic_model text null,
 created_at timestamptz not null default now()
);
create index if not exists sasi_v5_validation_owner_idx on public.sasi_v5_visual_validations(user_id,created_at desc);
create index if not exists sasi_v5_validation_kind_idx on public.sasi_v5_visual_validations(kind,passed,created_at desc);

create table if not exists public.sasi_v5_experiments(
 id uuid primary key default gen_random_uuid(),
 experiment_key text not null unique,
 capability text not null,
 stage text not null check(stage in ('shadow','canary','stable','stopped')),
 baseline_route text not null,
 candidate_route text not null,
 traffic_share numeric not null default 0 check(traffic_share between 0 and 1),
 content_scope text not null default 'public-benchmark' check(content_scope in ('public-benchmark','user-private','user-opt-in')),
 state text not null default 'active' check(state in ('active','paused','completed','rolled-back')),
 policy jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.sasi_v5_experiment_assignments(
 id uuid primary key default gen_random_uuid(),
 experiment_id uuid not null references public.sasi_v5_experiments(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 task_id uuid null references public.sasi_tasks(id) on delete set null,
 assigned boolean not null,
 bucket numeric not null check(bucket between 0 and 1),
 opted_in boolean not null default false,
 created_at timestamptz not null default now(),
 unique(experiment_id,user_id,task_id)
);

alter table public.sasi_v5_project_dna enable row level security;
alter table public.sasi_v5_approved_assets enable row level security;
alter table public.sasi_v5_visual_validations enable row level security;
alter table public.sasi_v5_experiments enable row level security;
alter table public.sasi_v5_experiment_assignments enable row level security;

drop policy if exists "sasi_v5_dna_owner_read" on public.sasi_v5_project_dna;
create policy "sasi_v5_dna_owner_read" on public.sasi_v5_project_dna for select to authenticated using(auth.uid()=user_id);
drop policy if exists "sasi_v5_assets_owner_read" on public.sasi_v5_approved_assets;
create policy "sasi_v5_assets_owner_read" on public.sasi_v5_approved_assets for select to authenticated using(auth.uid()=user_id);
drop policy if exists "sasi_v5_validation_owner_read" on public.sasi_v5_visual_validations;
create policy "sasi_v5_validation_owner_read" on public.sasi_v5_visual_validations for select to authenticated using(auth.uid()=user_id);
drop policy if exists "sasi_v5_assignment_owner_read" on public.sasi_v5_experiment_assignments;
create policy "sasi_v5_assignment_owner_read" on public.sasi_v5_experiment_assignments for select to authenticated using(auth.uid()=user_id);

revoke all on public.sasi_v5_project_dna,public.sasi_v5_approved_assets,public.sasi_v5_visual_validations,public.sasi_v5_experiments,public.sasi_v5_experiment_assignments from anon,authenticated;
grant select on public.sasi_v5_project_dna,public.sasi_v5_approved_assets,public.sasi_v5_visual_validations,public.sasi_v5_experiment_assignments to authenticated;
grant all on public.sasi_v5_project_dna,public.sasi_v5_approved_assets,public.sasi_v5_visual_validations,public.sasi_v5_experiments,public.sasi_v5_experiment_assignments to service_role;

commit;
