-- CangXuan Director Data Foundry V0: provenance, consent, extracted knowledge and continuity memory.
begin;

create table if not exists public.cangxuan_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  source_type text not null check (source_type in ('conversation_paste','chatgpt_export','sasi_native','licensed_open','teacher_synthetic')),
  rights_scope text not null default 'private_reference' check (rights_scope in ('private_reference','opted_in_training','open_licensed','research_only','blocked')),
  trainability text not null default 'private_only' check (trainability in ('private_only','trainable','research_only','blocked')),
  license_metadata jsonb not null default '{}'::jsonb,
  consent_version text,
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  character_count integer not null check (character_count between 1 and 200000),
  extracted_count integer not null default 0 check (extracted_count between 0 and 1000),
  created_at timestamptz not null default now(),
  unique (user_id, content_hash)
);

create table if not exists public.cangxuan_knowledge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null references public.cangxuan_sources(id) on delete cascade,
  category text not null check (category in ('RULE','PREFERENCE','CORRECTION','CONTINUITY','SHOT','SCRIPT','CRITIQUE')),
  title text not null,
  statement text not null check (char_length(statement) between 1 and 1000),
  evidence text not null check (char_length(evidence) between 1 and 1200),
  tier text not null default 'bronze' check (tier in ('bronze','silver','gold')),
  trainability text not null check (trainability in ('private_only','trainable','research_only','blocked')),
  quality_score numeric(4,3) not null check (quality_score between 0 and 1),
  review_status text not null default 'draft' check (review_status in ('draft','reviewed','approved','rejected')),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (user_id, content_hash)
);

create table if not exists public.cangxuan_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.sasi_projects(id) on delete cascade,
  character_key text not null check (character_key ~ '^[A-Z0-9_]{3,64}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  permanent_identity jsonb not null default '{}'::jsonb,
  identity_version integer not null default 1 check (identity_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, character_key, identity_version)
);

create table if not exists public.cangxuan_continuity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid not null references public.cangxuan_characters(id) on delete cascade,
  episode integer not null check (episode between 1 and 10000),
  scene integer not null check (scene between 1 and 10000),
  sequence integer not null default 1 check (sequence between 1 and 1000),
  script_event text not null check (char_length(script_event) between 1 and 1000),
  state_patch jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (character_id, episode, scene, sequence)
);

create index if not exists cangxuan_sources_user_idx on public.cangxuan_sources(user_id, created_at desc);
create index if not exists cangxuan_items_user_idx on public.cangxuan_knowledge_items(user_id, tier, created_at desc);
create index if not exists cangxuan_characters_user_idx on public.cangxuan_characters(user_id, updated_at desc);
create index if not exists cangxuan_events_character_idx on public.cangxuan_continuity_events(character_id, episode, scene, sequence);

alter table public.cangxuan_sources enable row level security;
alter table public.cangxuan_knowledge_items enable row level security;
alter table public.cangxuan_characters enable row level security;
alter table public.cangxuan_continuity_events enable row level security;

revoke all on public.cangxuan_sources, public.cangxuan_knowledge_items, public.cangxuan_characters, public.cangxuan_continuity_events from public, anon, authenticated;
grant all on public.cangxuan_sources, public.cangxuan_knowledge_items, public.cangxuan_characters, public.cangxuan_continuity_events to service_role;

commit;
