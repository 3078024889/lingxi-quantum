begin;
create table if not exists public.lingxifield_e2e_evidence(evidence_id uuid primary key default gen_random_uuid(),owner_id uuid not null,scenario text not null,environment text not null,viewport text,evidence jsonb not null default '{}'::jsonb,passed boolean not null default false,created_at timestamptz not null default now());
alter table public.lingxifield_e2e_evidence enable row level security;
drop policy if exists lingxifield_e2e_evidence_owner on public.lingxifield_e2e_evidence;
create policy lingxifield_e2e_evidence_owner on public.lingxifield_e2e_evidence for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
