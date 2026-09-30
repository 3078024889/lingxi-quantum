begin;
create table if not exists public.lingxifield_execution_closures(closure_id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id uuid not null,task_id uuid not null,validated boolean not null default false,delivery_id uuid,quality numeric not null default 0,cost numeric not null default 0,latency_ms numeric not null default 0,created_at timestamptz not null default now(),unique(owner_id,task_id));
alter table public.lingxifield_execution_closures enable row level security;
drop policy if exists lingxifield_execution_closures_owner on public.lingxifield_execution_closures;
create policy lingxifield_execution_closures_owner on public.lingxifield_execution_closures for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
