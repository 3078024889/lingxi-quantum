begin;
create table public.sasi_series_productions_v78(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null,
 project_id uuid not null references public.sasi_projects(id) on delete cascade,
 thread_id uuid references public.sasi_conversation_threads(id) on delete set null,
 input_hash text not null,
 brief text not null check(length(brief) between 1 and 24000),
 approved_script text not null default '' check(length(approved_script)<=32768),
 specification jsonb not null,
 plan_runs jsonb not null default '[]'::jsonb,
 revision integer not null default 0,
 state text not null default 'planning' check(state in('planning','ready','needs-connection','failed','generating','complete')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,project_id,input_hash)
);
alter table public.sasi_series_productions_v78 enable row level security;
revoke all on public.sasi_series_productions_v78 from public,anon,authenticated;
grant all on public.sasi_series_productions_v78 to service_role;
create index sasi_series_owner_project_v78 on public.sasi_series_productions_v78(user_id,project_id,created_at desc);
commit;
