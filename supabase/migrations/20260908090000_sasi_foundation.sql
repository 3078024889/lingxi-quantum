-- LingxiField SASI phase-one ledger and editable job graph.
-- Apply this migration before setting SASI_BILLING_ENABLED=true.

create table if not exists public.sasi_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available_points bigint not null default 0 check (available_points >= 0),
  reserved_points bigint not null default 0 check (reserved_points >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.sasi_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('topup','reserve','settle','release','refund','adjustment')),
  delta_available bigint not null default 0,
  delta_reserved bigint not null default 0,
  available_after bigint not null check (available_after >= 0),
  reserved_after bigint not null check (reserved_after >= 0),
  reference_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (kind, reference_id)
);

create table if not exists public.sasi_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid,
  kind text not null check (kind in ('build','drama')),
  title text not null,
  language text not null default 'zh' check (language in ('zh','en')),
  current_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sasi_projects add column if not exists request_id uuid;

create table if not exists public.sasi_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.sasi_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  node_type text not null,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft','ready','running','complete','failed','stale','locked')),
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sasi_node_dependencies (
  upstream_node_id uuid not null references public.sasi_nodes(id) on delete cascade,
  downstream_node_id uuid not null references public.sasi_nodes(id) on delete cascade,
  primary key (upstream_node_id, downstream_node_id),
  check (upstream_node_id <> downstream_node_id)
);

create table if not exists public.sasi_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.sasi_projects(id) on delete cascade,
  node_id uuid references public.sasi_nodes(id) on delete set null,
  provider text not null,
  model text not null,
  status text not null default 'prepared' check (status in ('prepared','confirmed','queued','running','succeeded','failed','cancelled')),
  quoted_points bigint not null check (quoted_points >= 0),
  reserved_points bigint not null default 0 check (reserved_points >= 0),
  settled_points bigint not null default 0 check (settled_points >= 0),
  provider_cost_minor bigint,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sasi_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.sasi_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket_id text not null default 'sasi-quarantine' check (bucket_id = 'sasi-quarantine'),
  object_path text not null unique,
  original_name text not null check (char_length(original_name) between 1 and 240),
  media_kind text not null check (media_kind in ('document','image','audio','video','code','other')),
  declared_mime text,
  verified_mime text,
  declared_size bigint not null check (declared_size between 0 and 104857600),
  verified_size bigint check (verified_size between 0 and 104857600),
  sha256 text check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  status text not null default 'awaiting_upload' check (status in ('awaiting_upload','uploaded','inspecting','external_scan_required','ready','rejected','failed')),
  rejection_reason text,
  extracted_text text,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(extracted_text, ''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sasi-quarantine',
  'sasi-quarantine',
  false,
  104857600,
  array['text/plain','text/markdown','text/csv','text/yaml','application/yaml','application/json','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip','application/x-zip-compressed','image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/wav','audio/x-wav','audio/mp4','video/mp4','video/quicktime','video/webm','text/javascript','application/javascript','text/typescript','text/css','text/html','application/sql','text/x-python','application/octet-stream']
)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create index if not exists sasi_ledger_user_created_idx on public.sasi_credit_ledger(user_id, created_at desc);
create index if not exists sasi_projects_user_updated_idx on public.sasi_projects(user_id, updated_at desc);
create unique index if not exists sasi_projects_user_request_uidx on public.sasi_projects(user_id, request_id) where request_id is not null;
create index if not exists sasi_nodes_project_idx on public.sasi_nodes(project_id, created_at);
create index if not exists sasi_jobs_user_created_idx on public.sasi_jobs(user_id, created_at desc);
create index if not exists sasi_assets_project_created_idx on public.sasi_assets(project_id, created_at);
create index if not exists sasi_assets_search_idx on public.sasi_assets using gin(search_vector);

alter table public.sasi_wallets enable row level security;
alter table public.sasi_credit_ledger enable row level security;
alter table public.sasi_projects enable row level security;
alter table public.sasi_nodes enable row level security;
alter table public.sasi_node_dependencies enable row level security;
alter table public.sasi_jobs enable row level security;
alter table public.sasi_assets enable row level security;

drop policy if exists "own sasi wallet read" on public.sasi_wallets;
drop policy if exists "own sasi ledger read" on public.sasi_credit_ledger;
drop policy if exists "own sasi projects" on public.sasi_projects;
drop policy if exists "own sasi nodes" on public.sasi_nodes;
drop policy if exists "own sasi dependencies" on public.sasi_node_dependencies;
drop policy if exists "own sasi jobs read" on public.sasi_jobs;
drop policy if exists "own sasi assets read" on public.sasi_assets;
create policy "own sasi wallet read" on public.sasi_wallets for select using (auth.uid() = user_id);
create policy "own sasi ledger read" on public.sasi_credit_ledger for select using (auth.uid() = user_id);
create policy "own sasi projects" on public.sasi_projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sasi nodes" on public.sasi_nodes for all
using (
  auth.uid() = user_id and exists (
    select 1 from public.sasi_projects p where p.id = project_id and p.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id and exists (
    select 1 from public.sasi_projects p where p.id = project_id and p.user_id = auth.uid()
  )
);
create policy "own sasi dependencies" on public.sasi_node_dependencies for select using (
  exists (select 1 from public.sasi_nodes n where n.id = upstream_node_id and n.user_id = auth.uid())
);
create policy "own sasi jobs read" on public.sasi_jobs for select using (auth.uid() = user_id);
create policy "own sasi assets read" on public.sasi_assets for select using (
  auth.uid() = user_id and exists (
    select 1 from public.sasi_projects p where p.id = project_id and p.user_id = auth.uid()
  )
);

revoke insert, update, delete on public.sasi_wallets, public.sasi_credit_ledger, public.sasi_jobs, public.sasi_assets from anon, authenticated;
grant select on public.sasi_wallets, public.sasi_credit_ledger, public.sasi_jobs, public.sasi_assets to authenticated;
grant select on public.sasi_projects, public.sasi_nodes, public.sasi_node_dependencies to authenticated;
grant all on public.sasi_wallets, public.sasi_credit_ledger, public.sasi_projects, public.sasi_nodes, public.sasi_node_dependencies, public.sasi_jobs, public.sasi_assets to service_role;

-- Create a project and its initial editable production graph in one transaction.
-- The authenticated user is derived from the JWT and cannot be supplied by the client.
create or replace function public.create_sasi_project(
  p_request_id uuid,
  p_kind text,
  p_title text,
  p_language text,
  p_input jsonb,
  p_stages text[]
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
  v_node_id uuid;
  v_previous_node_id uuid;
  v_stage text;
  v_position integer := 0;
  v_created boolean := false;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if p_kind not in ('build', 'drama') then raise exception 'invalid project kind'; end if;
  if p_language not in ('zh', 'en') then raise exception 'invalid language'; end if;
  if char_length(trim(p_title)) < 1 or char_length(p_title) > 72 then raise exception 'invalid project title'; end if;
  if coalesce(array_length(p_stages, 1), 0) < 1 or array_length(p_stages, 1) > 20 then raise exception 'invalid project stages'; end if;

  if p_request_id is null then raise exception 'request id required'; end if;

  insert into public.sasi_projects(user_id, request_id, kind, title, language)
  values (v_user_id, p_request_id, p_kind, trim(p_title), p_language)
  on conflict (user_id, request_id) where request_id is not null do nothing
  returning id into v_project_id;

  if v_project_id is null then
    select id into v_project_id from public.sasi_projects
    where user_id = v_user_id and request_id = p_request_id;
    select count(*)::integer into v_position from public.sasi_nodes where project_id = v_project_id;
    return jsonb_build_object(
      'id', v_project_id,
      'kind', p_kind,
      'title', trim(p_title),
      'language', p_language,
      'currentVersion', 1,
      'nodeCount', v_position,
      'status', 'prepared',
      'created', false
    );
  end if;
  v_created := true;

  foreach v_stage in array p_stages loop
    if v_stage !~ '^[a-z][a-z0-9-]{1,48}$' then raise exception 'invalid stage'; end if;
    v_position := v_position + 1;
    insert into public.sasi_nodes(project_id, user_id, node_type, status, input)
    values (
      v_project_id,
      v_user_id,
      v_stage,
      case when v_position = 1 then 'ready' else 'draft' end,
      case when v_position = 1 then coalesce(p_input, '{}'::jsonb) else jsonb_build_object('position', v_position) end
    ) returning id into v_node_id;
    if v_previous_node_id is not null then
      insert into public.sasi_node_dependencies(upstream_node_id, downstream_node_id)
      values (v_previous_node_id, v_node_id);
    end if;
    v_previous_node_id := v_node_id;
  end loop;

  return jsonb_build_object(
    'id', v_project_id,
    'kind', p_kind,
    'title', trim(p_title),
    'language', p_language,
    'currentVersion', 1,
    'nodeCount', v_position,
    'status', 'prepared',
    'created', v_created
  );
end $$;
drop function if exists public.create_sasi_project(text, text, text, jsonb, text[]);
revoke execute on function public.create_sasi_project(uuid, text, text, text, jsonb, text[]) from public, anon;
grant execute on function public.create_sasi_project(uuid, text, text, text, jsonb, text[]) to authenticated, service_role;

-- Atomic reserve. Only the service role may execute it after the user confirms a visible quote.
create or replace function public.reserve_sasi_points(p_user_id uuid, p_job_id uuid, p_points bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_wallet public.sasi_wallets%rowtype;
begin
  if p_points <= 0 then raise exception 'invalid points'; end if;
  insert into public.sasi_wallets(user_id) values (p_user_id) on conflict do nothing;
  select * into v_wallet from public.sasi_wallets where user_id = p_user_id for update;
  if v_wallet.available_points < p_points then raise exception 'insufficient balance'; end if;
  update public.sasi_wallets set available_points = available_points - p_points, reserved_points = reserved_points + p_points, updated_at = now() where user_id = p_user_id returning * into v_wallet;
  insert into public.sasi_credit_ledger(user_id, kind, delta_available, delta_reserved, available_after, reserved_after, reference_id)
  values (p_user_id, 'reserve', -p_points, p_points, v_wallet.available_points, v_wallet.reserved_points, p_job_id::text);
  return jsonb_build_object('availablePoints', v_wallet.available_points, 'reservedPoints', v_wallet.reserved_points);
end $$;
revoke execute on function public.reserve_sasi_points(uuid, uuid, bigint) from public, anon, authenticated;
grant execute on function public.reserve_sasi_points(uuid, uuid, bigint) to service_role;

-- Settlement/release and top-up credit must be added as server-only RPCs together
-- with verified payment/provider callbacks before billing is enabled.
