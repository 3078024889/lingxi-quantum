begin;
create table if not exists public.sasi_execution_events(event_id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id uuid,task_id uuid,event_type text not null,payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table if not exists public.sasi_result_evidence(evidence_id uuid primary key default gen_random_uuid(),owner_id uuid not null,result_id uuid,kind text not null,ref text not null,value jsonb,created_at timestamptz not null default now());
alter table public.sasi_execution_events enable row level security;alter table public.sasi_result_evidence enable row level security;
drop policy if exists sasi_execution_events_owner on public.sasi_execution_events;create policy sasi_execution_events_owner on public.sasi_execution_events for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
drop policy if exists sasi_result_evidence_owner on public.sasi_result_evidence;create policy sasi_result_evidence_owner on public.sasi_result_evidence for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
