-- Internal Telegram event deduplication only; no member content or identifiers.
create table if not exists public.telegram_community_events (
  event_key text primary key,
  event_kind text not null check (event_kind in ('webhook', 'daily')),
  status text not null check (status in ('claimed', 'delivered', 'failed')),
  created_at timestamptz not null default now()
);
alter table public.telegram_community_events enable row level security;
revoke all on public.telegram_community_events from anon, authenticated;
create index if not exists telegram_community_events_created_at_idx
  on public.telegram_community_events (created_at);
