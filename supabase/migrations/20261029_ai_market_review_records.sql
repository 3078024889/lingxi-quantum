-- Review-only storage. Apply only after staging database review.
create table if not exists public.ai_market_review_records (
 id uuid primary key default gen_random_uuid(),
 revision text not null,
 category text not null check (category in ('design','data','localization','commerce','security','release')),
 decision text not null default 'feedback' check (decision in ('feedback','request_changes','acknowledged')),
 note text not null check (char_length(note) between 3 and 2000),
 actor_id uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create index if not exists ai_market_review_records_revision_created
 on public.ai_market_review_records (revision, created_at desc);
alter table public.ai_market_review_records enable row level security;
revoke all on public.ai_market_review_records from anon, authenticated;
-- service_role only, after server-side moneyAdministrator() authorization.
-- Review records cannot approve, publish or change production content.
