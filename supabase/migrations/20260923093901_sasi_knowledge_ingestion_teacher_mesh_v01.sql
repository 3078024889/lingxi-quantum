-- SASI Knowledge Ingestion & Teacher Mesh v0.1

begin;

create table if not exists public.sasi_ingestion_sources (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid null references auth.users(id) on delete cascade,
  project_id uuid null references public.sasi_projects(id) on delete cascade,
  kind text not null,
  source_class text not null,
  title text not null,
  content_hash text not null,
  locator text null,
  url text null,
  published_at timestamptz null,
  retrieved_at timestamptz not null default now(),
  language text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sasi_ingestion_sources_content_hash_idx
  on public.sasi_ingestion_sources (content_hash);

create table if not exists public.sasi_knowledge_candidates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid null references public.sasi_projects(id) on delete cascade,
  concept text not null,
  domain text not null,
  payload jsonb not null,
  source_ids uuid[] not null default '{}',
  created_by_kind text not null check (
    created_by_kind in ('extractor','teacher','human')
  ),
  created_by_id text not null,
  state text not null default 'candidate'
    check (
      state in (
        'candidate',
        'needs-evidence',
        'under-review',
        'ready-for-promotion',
        'promoted',
        'rejected'
      )
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sasi_teacher_profiles (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model text not null,
  enabled boolean not null default false,
  verified boolean not null default false,
  byok boolean not null default true,
  roles jsonb not null default '[]'::jsonb,
  domains jsonb not null default '[]'::jsonb,
  reliability numeric not null default 0.5 check (reliability between 0 and 1),
  cost_weight numeric not null default 0.5 check (cost_weight between 0 and 1),
  latency_weight numeric not null default 0.5 check (latency_weight between 0 and 1),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(provider, model, byok)
);

create table if not exists public.sasi_teacher_reviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.sasi_knowledge_candidates(id) on delete cascade,
  teacher_profile_id uuid null references public.sasi_teacher_profiles(id) on delete set null,
  teacher_id text not null,
  verdict text not null check (
    verdict in ('support','challenge','insufficient-evidence','out-of-domain')
  ),
  confidence numeric not null check (confidence between 0 and 1),
  issues jsonb not null default '[]'::jsonb,
  suggested_corrections jsonb not null default '[]'::jsonb,
  evidence_requests jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.sasi_ingestion_sources enable row level security;
alter table public.sasi_knowledge_candidates enable row level security;
alter table public.sasi_teacher_profiles enable row level security;
alter table public.sasi_teacher_reviews enable row level security;

drop policy if exists "sasi_ingestion_owner_read" on public.sasi_ingestion_sources;
create policy "sasi_ingestion_owner_read"
on public.sasi_ingestion_sources
for select to authenticated
using (owner_user_id = auth.uid());

-- No direct authenticated write policies for candidate promotion or teacher reviews.
-- Trusted workers perform ingestion/review/promotion using service_role.

commit;
