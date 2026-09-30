begin;
create table if not exists public.lingxifield_remote_gate_evidence(evidence_id uuid primary key default gen_random_uuid(),owner_id uuid not null,gate text not null,status text not null check(status in ('PASS','FAIL','NOT_PROVEN','PARTIAL_HTTP_ONLY')),evidence jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
alter table public.lingxifield_remote_gate_evidence enable row level security;
drop policy if exists lingxifield_remote_gate_evidence_owner on public.lingxifield_remote_gate_evidence;
create policy lingxifield_remote_gate_evidence_owner on public.lingxifield_remote_gate_evidence for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
