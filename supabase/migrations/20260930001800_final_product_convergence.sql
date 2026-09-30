begin;
create table if not exists public.lingxifield_person_dna(id uuid primary key default gen_random_uuid(),owner_id uuid not null unique,data jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now());
create table if not exists public.lingxifield_project_dna(id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id text not null,data jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now(),unique(owner_id,project_id));
create table if not exists public.lingxifield_result_dna(id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id text,result_id text not null,data jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),unique(owner_id,result_id));
create table if not exists public.lingxifield_failure_patterns(id uuid primary key default gen_random_uuid(),signature text not null unique,count bigint not null default 0,preferred_capability text,avoid_capability text,confidence double precision not null default 0,updated_at timestamptz not null default now());
do $$ declare t text; begin foreach t in array array['lingxifield_person_dna','lingxifield_project_dna','lingxifield_result_dna'] loop execute format('alter table public.%I enable row level security',t); execute format('drop policy if exists %I on public.%I',t||'_owner',t); execute format('create policy %I on public.%I for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id)',t||'_owner',t); end loop; end $$;
alter table public.lingxifield_failure_patterns enable row level security;
commit;
