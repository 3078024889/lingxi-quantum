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
  kind text not null check (kind in ('build','drama')),
  title text not null,
  language text not null default 'zh' check (language in ('zh','en')),
  current_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists sasi_ledger_user_created_idx on public.sasi_credit_ledger(user_id, created_at desc);
create index if not exists sasi_projects_user_updated_idx on public.sasi_projects(user_id, updated_at desc);
create index if not exists sasi_nodes_project_idx on public.sasi_nodes(project_id, created_at);
create index if not exists sasi_jobs_user_created_idx on public.sasi_jobs(user_id, created_at desc);

alter table public.sasi_wallets enable row level security;
alter table public.sasi_credit_ledger enable row level security;
alter table public.sasi_projects enable row level security;
alter table public.sasi_nodes enable row level security;
alter table public.sasi_node_dependencies enable row level security;
alter table public.sasi_jobs enable row level security;

drop policy if exists "own sasi wallet read" on public.sasi_wallets;
drop policy if exists "own sasi ledger read" on public.sasi_credit_ledger;
drop policy if exists "own sasi projects" on public.sasi_projects;
drop policy if exists "own sasi nodes" on public.sasi_nodes;
drop policy if exists "own sasi dependencies" on public.sasi_node_dependencies;
drop policy if exists "own sasi jobs read" on public.sasi_jobs;
create policy "own sasi wallet read" on public.sasi_wallets for select using (auth.uid() = user_id);
create policy "own sasi ledger read" on public.sasi_credit_ledger for select using (auth.uid() = user_id);
create policy "own sasi projects" on public.sasi_projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sasi nodes" on public.sasi_nodes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sasi dependencies" on public.sasi_node_dependencies for select using (
  exists (select 1 from public.sasi_nodes n where n.id = upstream_node_id and n.user_id = auth.uid())
);
create policy "own sasi jobs read" on public.sasi_jobs for select using (auth.uid() = user_id);

revoke insert, update, delete on public.sasi_wallets, public.sasi_credit_ledger, public.sasi_jobs from anon, authenticated;
grant select on public.sasi_wallets, public.sasi_credit_ledger, public.sasi_jobs to authenticated;
grant all on public.sasi_wallets, public.sasi_credit_ledger, public.sasi_projects, public.sasi_nodes, public.sasi_node_dependencies, public.sasi_jobs to service_role;

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
