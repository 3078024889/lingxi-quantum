-- Independent intake for free project listing, correction, or claim requests.
-- A submission never changes a published project and never grants claim ownership.
create table if not exists public.ai_market_vendor_submissions (
 id uuid primary key default gen_random_uuid(),
 project_id text not null check (char_length(project_id) between 1 and 120),
 request_type text not null check (request_type in ('claim','update','list')),
 product_name text not null check (char_length(product_name) between 1 and 160),
 official_site text not null check (char_length(official_site) between 9 and 512 and official_site ~ '^https://'),
 work_email text not null check (char_length(work_email) between 6 and 254),
 submitter_name text not null check (char_length(submitter_name) between 1 and 120),
 description text check (description is null or char_length(description)<=1200),
 proposed_data jsonb not null default '{}'::jsonb,
 evidence_url text not null check (char_length(evidence_url) between 9 and 512 and evidence_url ~ '^https://'),
 status text not null default 'pending_identity_check' check (status in ('pending_identity_check','pending_review','approved','rejected')),
 verified_domain boolean not null default false,
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 check (jsonb_typeof(proposed_data)='object'),
 check ((status='approved' and verified_domain=true and reviewed_by is not null and reviewed_at is not null) or status<>'approved')
);
create index if not exists ai_market_vendor_submissions_status_created on public.ai_market_vendor_submissions(status,created_at desc);
create index if not exists ai_market_vendor_submissions_project on public.ai_market_vendor_submissions(project_id,created_at desc);
alter table public.ai_market_vendor_submissions enable row level security;
revoke all on public.ai_market_vendor_submissions from public,anon,authenticated;
-- RPC and any publishing workflow require verified official identity and separate editorial review.
