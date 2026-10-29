-- Add evidence, moderation and commercial request staging without changing existing product tables.
create table if not exists public.ai_directory_evidence (
 id uuid primary key default gen_random_uuid(),
 tool_id uuid not null references public.ai_directory_tools(id) on delete cascade,
 metric_key text not null,
 metric_value numeric,
 metric_unit text,
 geography text,
 period_start date,
 period_end date,
 source_url text not null check (source_url ~ '^https://'),
 source_name text not null,
 evidence_kind text not null check (evidence_kind in ('official','third_party','estimate')),
 observed_at timestamptz not null,
 reviewed_at timestamptz,
 review_status text not null default 'pending' check (review_status in ('pending','approved','rejected')),
 notes text,
 created_at timestamptz not null default now(),
 constraint ai_evidence_window_valid check (period_start is null or period_end is null or period_start <= period_end),
 constraint ai_evidence_numeric_valid check (metric_value is null or metric_value >= 0)
);
create index if not exists ai_directory_evidence_tool_idx on public.ai_directory_evidence(tool_id,metric_key,observed_at desc);
create table if not exists public.ai_directory_submissions (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 official_url text not null check (official_url ~ '^https://'),
 submitter_contact text,
 description text,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 created_at timestamptz not null default now()
);
create table if not exists public.ai_directory_sponsorship_requests (
 id uuid primary key default gen_random_uuid(),
 brand_name text not null,
 contact text not null,
 requested_category text,
 status text not null default 'inquiry' check (status in ('inquiry','review','approved','rejected','expired')),
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz not null default now(),
 constraint ai_sponsor_dates_valid check (starts_at is null or ends_at is null or starts_at < ends_at)
);
alter table public.ai_directory_evidence enable row level security;
alter table public.ai_directory_submissions enable row level security;
alter table public.ai_directory_sponsorship_requests enable row level security;
create policy ai_evidence_approved_read on public.ai_directory_evidence for select to anon,authenticated using (review_status='approved');
-- Submission and sponsorship requests are intentionally service-role-only until authenticated, rate-limited intake is implemented.
-- No anonymous INSERT, UPDATE or DELETE policies.
