begin;
create table if not exists public.lingxifield_runtime_sessions(session_id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id uuid not null,task_id uuid not null,status text not null check(status in ('running','completed','failed','paused')),started_at timestamptz not null default now(),finished_at timestamptz);
create unique index if not exists lingxifield_runtime_sessions_task_idx on public.lingxifield_runtime_sessions(owner_id,task_id);
alter table public.lingxifield_runtime_sessions enable row level security;
drop policy if exists lingxifield_runtime_sessions_owner on public.lingxifield_runtime_sessions;
create policy lingxifield_runtime_sessions_owner on public.lingxifield_runtime_sessions for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
