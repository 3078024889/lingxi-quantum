-- LINGXIFIELD production reconciliation mirror, 2026-09-30.
-- Production objects were applied and verified first. This migration keeps source history aligned.
-- Existing legacy tables (including sasi_artifacts with user_id) are intentionally not redefined here.
begin;
create table if not exists public.lingxifield_security_closure_evidence(
 id uuid primary key default gen_random_uuid(),
 gate text not null,
 status text not null check(status in ('PASS','INFO','WARN','NOT_PROVEN')),
 evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.lingxifield_security_closure_evidence enable row level security;
revoke all on public.lingxifield_security_closure_evidence from anon, authenticated;
grant all on public.lingxifield_security_closure_evidence to service_role;
commit;
