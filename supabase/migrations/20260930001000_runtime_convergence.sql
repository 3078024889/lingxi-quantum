begin;
create table if not exists public.lingxifield_deliveries(delivery_id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id uuid not null,task_id uuid not null,deliverables jsonb not null default '[]'::jsonb,validated boolean not null default false,issues jsonb not null default '[]'::jsonb,created_at timestamptz not null default now());
create table if not exists public.lingxifield_user_corrections(correction_id uuid primary key default gen_random_uuid(),owner_id uuid not null,project_id uuid not null,field text not null,before_value jsonb,after_value jsonb,accepted boolean not null default false,created_at timestamptz not null default now());
alter table public.lingxifield_deliveries enable row level security;alter table public.lingxifield_user_corrections enable row level security;
drop policy if exists lingxifield_deliveries_owner on public.lingxifield_deliveries;create policy lingxifield_deliveries_owner on public.lingxifield_deliveries for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
drop policy if exists lingxifield_user_corrections_owner on public.lingxifield_user_corrections;create policy lingxifield_user_corrections_owner on public.lingxifield_user_corrections for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
commit;
