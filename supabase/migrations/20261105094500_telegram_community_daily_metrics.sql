-- Aggregate-only community growth snapshot. No group-member names, IDs or message bodies.
create table if not exists public.telegram_community_daily_metrics (
  snapshot_day date primary key,
  member_count integer null check (member_count >= 0),
  posts_delivered integer not null default 0 check(posts_delivered between 0 and 5),
  observed_at timestamptz not null default now()
);
alter table public.telegram_community_daily_metrics enable row level security;
revoke all on public.telegram_community_daily_metrics from anon, authenticated;
