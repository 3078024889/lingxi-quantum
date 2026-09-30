begin;
create table if not exists public.lingxifield_closure_evidence(evidence_id uuid primary key default gen_random_uuid(),owner_id uuid not null,gate text not null,evidence jsonb not null default '[]'::jsonb,passed boolean not null default false,created_at timestamptz not null default now());
alter table public.lingxifield_closure_evidence enable row level security;
drop policy if exists lingxifield_closure_evidence_owner on public.lingxifield_closure_evidence;
create policy lingxifield_closure_evidence_owner on public.lingxifield_closure_evidence for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
