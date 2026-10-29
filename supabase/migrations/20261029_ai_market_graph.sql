-- Staging-only relational entity foundation, not a production migration.
create table if not exists public.ai_market_entities (
 id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,119}$'),
 kind text not null check(kind in ('company','product','model','version')),
 display_name text not null check(char_length(display_name) between 1 and 250),
 official_url text,
 verification_status text not null default 'candidate' check(verification_status in ('candidate','verified','rejected','discontinued')),
 evidence_url text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.ai_market_entity_links (
 from_id text not null references public.ai_market_entities(id) on delete restrict,
 to_id text not null references public.ai_market_entities(id) on delete restrict,
 relation text not null check(relation in ('owns','provides','releases')),
 created_at timestamptz not null default now(),
 primary key (from_id,to_id,relation),
 check(from_id <> to_id)
);
create index if not exists ai_market_entities_kind_status on public.ai_market_entities(kind,verification_status);
create index if not exists ai_market_entity_links_target on public.ai_market_entity_links(to_id,relation);
alter table public.ai_market_entities enable row level security;
alter table public.ai_market_entity_links enable row level security;
revoke all on public.ai_market_entities from anon,authenticated;
revoke all on public.ai_market_entity_links from anon,authenticated;
-- Server-side reviewed access only. Cross-kind link checks are enforced in application validation;
-- add database trigger-based validation before enabling public ingest.
