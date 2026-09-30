begin;
create table if not exists public.lingxifield_execution_commands(command_id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id uuid not null,task_id uuid not null,idempotency_key text not null,command jsonb not null,status text not null default 'accepted' check(status in ('accepted','running','completed','failed')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(owner_id,idempotency_key));
alter table public.lingxifield_execution_commands enable row level security;
drop policy if exists lingxifield_execution_commands_owner on public.lingxifield_execution_commands;
create policy lingxifield_execution_commands_owner on public.lingxifield_execution_commands for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
