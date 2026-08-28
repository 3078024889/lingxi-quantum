-- Lingxi Field V318 · native assessment archive reliability
-- Safe to run more than once in Supabase SQL Editor.
-- This migration intentionally creates the archive table when V314 was skipped;
-- V315 alone used ALTER TABLE IF EXISTS and therefore could not repair a missing table.

create table if not exists public.mini_dendrite_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null check (product_id in (
    'life-map-report','relationship-resonance','resilience-report','romance-report',
    'wealth-report','daily-tide-report','tarot-reading','qian-reading','life-archetype'
  )),
  input jsonb not null,
  result jsonb not null,
  algorithm_version text not null default 'lingxifield-dendritic-v2',
  created_at timestamptz not null default now()
);

alter table public.mini_dendrite_assessments
  alter column algorithm_version set default 'lingxifield-dendritic-v2';

create index if not exists mini_dendrite_assessments_user_created_idx
  on public.mini_dendrite_assessments (user_id, created_at desc);
create index if not exists mini_dendrite_assessments_user_product_idx
  on public.mini_dendrite_assessments (user_id, product_id, created_at desc);

alter table public.mini_dendrite_assessments enable row level security;
drop policy if exists "own mini dendrite assessments read" on public.mini_dendrite_assessments;
create policy "own mini dendrite assessments read" on public.mini_dendrite_assessments
  for select using (auth.uid() = user_id);

revoke insert, update, delete on table public.mini_dendrite_assessments from anon, authenticated;
grant select on table public.mini_dendrite_assessments to authenticated;
grant all on table public.mini_dendrite_assessments to service_role;

comment on table public.mini_dendrite_assessments is
  'V318 native Mini Program field reports and automatically converged Life Archetype archives.';

-- The final row is a non-mutating installation check. It should return
-- table_ready=true and algorithm_version=lingxifield-dendritic-v2.
select
  to_regclass('public.mini_dendrite_assessments') is not null as table_ready,
  column_default as algorithm_version
from information_schema.columns
where table_schema = 'public'
  and table_name = 'mini_dendrite_assessments'
  and column_name = 'algorithm_version';
