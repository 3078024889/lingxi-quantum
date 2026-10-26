-- Isolated AI Discovery schema. No existing table or policy is changed.
create table if not exists public.ai_directory_tools (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null, category text not null, description text not null,
 official_url text not null check (official_url ~ '^https://'),
 pricing_model text not null default 'unknown',
 review_status text not null default 'pending' check (review_status in ('pending','approved','rejected')),
 sponsored boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.ai_visibility_observations (
 id bigint generated always as identity primary key,
 tool_id uuid not null references public.ai_directory_tools(id) on delete cascade,
 engine text not null, query_text text not null, locale text not null default 'en',
 observed_at timestamptz not null default now(),
 mentioned boolean not null, cited boolean not null,
 rank_position integer check (rank_position > 0),
 source_url text, methodology_version text not null default 'v1'
);
create index if not exists ai_visibility_tool_time_idx on public.ai_visibility_observations(tool_id,observed_at desc);
alter table public.ai_directory_tools enable row level security;
alter table public.ai_visibility_observations enable row level security;
create policy ai_directory_approved_public_read on public.ai_directory_tools for select to anon, authenticated using (review_status='approved');
-- No public access to raw observations or writes; service role only.
