begin;
create table if not exists public.lingxifield_final_closure_evidence(
 id uuid primary key default gen_random_uuid(), owner_id uuid not null,
 gate text not null, status text not null check(status in ('REAL_PASS','FAIL','NOT_PROVEN','PARTIAL')),
 evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
alter table public.lingxifield_final_closure_evidence enable row level security;
drop policy if exists lingxifield_final_closure_evidence_owner on public.lingxifield_final_closure_evidence;
create policy lingxifield_final_closure_evidence_owner on public.lingxifield_final_closure_evidence
for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
