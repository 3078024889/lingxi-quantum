begin;
create table if not exists public.lingxifield_tool_runs(run_id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id uuid,tool text not null,engine text not null,operation text not null,status text not null check(status in ('queued','running','validating','completed','failed')),artifacts jsonb not null default '[]'::jsonb,issues jsonb not null default '[]'::jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists lingxifield_tool_runs_owner_created_idx on public.lingxifield_tool_runs(owner_id,created_at desc);
alter table public.lingxifield_tool_runs enable row level security;
drop policy if exists lingxifield_tool_runs_owner on public.lingxifield_tool_runs;
create policy lingxifield_tool_runs_owner on public.lingxifield_tool_runs for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
