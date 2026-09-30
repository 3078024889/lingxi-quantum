begin;
create table if not exists public.lingxifield_verification_runs(run_id uuid primary key default gen_random_uuid(),owner_id uuid not null,environment text not null,evidence jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
alter table public.lingxifield_verification_runs enable row level security;
drop policy if exists lingxifield_verification_runs_owner on public.lingxifield_verification_runs;
create policy lingxifield_verification_runs_owner on public.lingxifield_verification_runs for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
