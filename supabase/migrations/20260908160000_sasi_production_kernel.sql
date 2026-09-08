-- SASI production-account and queued-video kernel.
-- All monetary fulfillment and job settlement functions are service-role only.

begin;

alter table public.sasi_jobs add column if not exists request_id uuid;
alter table public.sasi_jobs add column if not exists provider_job_id text;
alter table public.sasi_jobs add column if not exists error_code text;
alter table public.sasi_jobs add column if not exists started_at timestamptz;
alter table public.sasi_jobs add column if not exists completed_at timestamptz;
create unique index if not exists sasi_jobs_user_request_uidx
  on public.sasi_jobs(user_id, request_id) where request_id is not null;
create unique index if not exists sasi_jobs_provider_job_uidx
  on public.sasi_jobs(provider, provider_job_id) where provider_job_id is not null;

create table if not exists public.sasi_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.sasi_projects(id) on delete cascade,
  job_id uuid not null references public.sasi_jobs(id) on delete cascade,
  bucket_id text not null default 'sasi-deliveries' check (bucket_id = 'sasi-deliveries'),
  object_path text not null unique,
  media_kind text not null default 'video' check (media_kind in ('video','audio','image','archive')),
  mime_type text not null,
  byte_size bigint not null check (byte_size between 1 and 104857600),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  ai_generated boolean not null default true,
  label_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (job_id)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sasi-deliveries',
  'sasi-deliveries',
  false,
  104857600,
  array['video/mp4','video/webm','video/quicktime','audio/mpeg','audio/wav','image/jpeg','image/png','image/webp','application/zip']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create index if not exists sasi_deliveries_user_created_idx on public.sasi_deliveries(user_id, created_at desc);
alter table public.sasi_deliveries enable row level security;
drop policy if exists "own sasi deliveries read" on public.sasi_deliveries;
create policy "own sasi deliveries read" on public.sasi_deliveries
  for select using (auth.uid() = user_id);
revoke insert, update, delete on public.sasi_deliveries from anon, authenticated;
grant select on public.sasi_deliveries to authenticated;
grant all on public.sasi_deliveries to service_role;

create or replace function public.credit_sasi_topup(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_wallet public.sasi_wallets%rowtype;
  v_points bigint;
  v_expected_rmb numeric;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'order_not_found'); end if;

  select x.points, x.amount_rmb into v_points, v_expected_rmb
  from (values
    ('sasi-credit-entry'::text, 2000::bigint, 20::numeric),
    ('sasi-credit-studio'::text, 10000::bigint, 100::numeric),
    ('sasi-credit-reserve'::text, 50000::bigint, 500::numeric)
  ) as x(product_id, points, amount_rmb)
  where x.product_id = v_order.product_id;

  if v_points is null then return jsonb_build_object('ok', false, 'error', 'invalid_sasi_product'); end if;
  if v_order.status not in ('pending', 'paid') then return jsonb_build_object('ok', false, 'error', 'order_not_payable'); end if;
  if v_order.amount_rmb is null or round(v_order.amount_rmb, 2) <> round(v_expected_rmb, 2) then
    return jsonb_build_object('ok', false, 'error', 'amount_mismatch');
  end if;

  if exists (select 1 from public.sasi_credit_ledger where kind = 'topup' and reference_id = p_order_id::text) then
    update public.orders set status = 'paid', paid_at = coalesce(paid_at, now()) where id = p_order_id;
    return jsonb_build_object('ok', true, 'alreadyPaid', true, 'points', v_points);
  end if;

  insert into public.sasi_wallets(user_id) values (v_order.user_id) on conflict do nothing;
  select * into v_wallet from public.sasi_wallets where user_id = v_order.user_id for update;
  update public.sasi_wallets
    set available_points = available_points + v_points, updated_at = now()
    where user_id = v_order.user_id returning * into v_wallet;
  insert into public.sasi_credit_ledger(
    user_id, kind, delta_available, delta_reserved, available_after, reserved_after, reference_id, metadata
  ) values (
    v_order.user_id, 'topup', v_points, 0, v_wallet.available_points, v_wallet.reserved_points,
    p_order_id::text, jsonb_build_object('productId', v_order.product_id, 'provider', v_order.provider)
  );
  update public.orders set status = 'paid', paid_at = coalesce(paid_at, now()) where id = p_order_id;
  return jsonb_build_object('ok', true, 'alreadyPaid', false, 'points', v_points,
    'availablePoints', v_wallet.available_points, 'reservedPoints', v_wallet.reserved_points);
end $$;
revoke execute on function public.credit_sasi_topup(uuid) from public, anon, authenticated;
grant execute on function public.credit_sasi_topup(uuid) to service_role;

create or replace function public.create_and_reserve_sasi_job(
  p_user_id uuid,
  p_request_id uuid,
  p_project_id uuid,
  p_node_id uuid,
  p_provider text,
  p_model text,
  p_quoted_points bigint,
  p_input jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_wallet public.sasi_wallets%rowtype;
  v_job public.sasi_jobs%rowtype;
begin
  if p_user_id is null or p_request_id is null then return jsonb_build_object('ok', false, 'error', 'invalid_identity'); end if;
  if p_quoted_points <= 0 then return jsonb_build_object('ok', false, 'error', 'invalid_quote'); end if;
  if not exists (select 1 from public.sasi_projects where id = p_project_id and user_id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'project_not_found');
  end if;
  if p_node_id is not null and not exists (
    select 1 from public.sasi_nodes where id = p_node_id and project_id = p_project_id and user_id = p_user_id
  ) then return jsonb_build_object('ok', false, 'error', 'node_not_found'); end if;

  select * into v_job from public.sasi_jobs where user_id = p_user_id and request_id = p_request_id;
  if found then
    return jsonb_build_object('ok', true, 'created', false, 'jobId', v_job.id,
      'status', v_job.status, 'reservedPoints', v_job.reserved_points);
  end if;

  insert into public.sasi_wallets(user_id) values (p_user_id) on conflict do nothing;
  select * into v_wallet from public.sasi_wallets where user_id = p_user_id for update;
  if v_wallet.available_points < p_quoted_points then
    return jsonb_build_object('ok', false, 'error', 'insufficient_balance',
      'availablePoints', v_wallet.available_points, 'requiredPoints', p_quoted_points);
  end if;

  insert into public.sasi_jobs(
    user_id, request_id, project_id, node_id, provider, model, status,
    quoted_points, reserved_points, input
  ) values (
    p_user_id, p_request_id, p_project_id, p_node_id, p_provider, p_model, 'confirmed',
    p_quoted_points, p_quoted_points, coalesce(p_input, '{}'::jsonb)
  ) returning * into v_job;

  update public.sasi_wallets
    set available_points = available_points - p_quoted_points,
        reserved_points = reserved_points + p_quoted_points,
        updated_at = now()
    where user_id = p_user_id returning * into v_wallet;
  insert into public.sasi_credit_ledger(
    user_id, kind, delta_available, delta_reserved, available_after, reserved_after, reference_id, metadata
  ) values (
    p_user_id, 'reserve', -p_quoted_points, p_quoted_points,
    v_wallet.available_points, v_wallet.reserved_points, v_job.id::text,
    jsonb_build_object('projectId', p_project_id, 'requestId', p_request_id)
  );
  if p_node_id is not null then
    update public.sasi_nodes set status = 'running', updated_at = now() where id = p_node_id;
  end if;
  return jsonb_build_object('ok', true, 'created', true, 'jobId', v_job.id,
    'status', v_job.status, 'reservedPoints', v_job.reserved_points,
    'availablePoints', v_wallet.available_points);
end $$;
revoke execute on function public.create_and_reserve_sasi_job(uuid, uuid, uuid, uuid, text, text, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.create_and_reserve_sasi_job(uuid, uuid, uuid, uuid, text, text, bigint, jsonb) to service_role;

create or replace function public.settle_sasi_job(
  p_job_id uuid,
  p_actual_points bigint,
  p_provider_cost_minor bigint,
  p_output jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_job public.sasi_jobs%rowtype;
  v_wallet public.sasi_wallets%rowtype;
  v_release bigint;
begin
  select * into v_job from public.sasi_jobs where id = p_job_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'job_not_found'); end if;
  if v_job.status = 'succeeded' then return jsonb_build_object('ok', true, 'alreadySettled', true); end if;
  if v_job.status in ('failed','cancelled') then return jsonb_build_object('ok', false, 'error', 'job_closed'); end if;
  if p_actual_points < 0 or p_actual_points > v_job.reserved_points then
    return jsonb_build_object('ok', false, 'error', 'invalid_settlement');
  end if;
  select * into v_wallet from public.sasi_wallets where user_id = v_job.user_id for update;
  v_release := v_job.reserved_points - p_actual_points;
  update public.sasi_wallets
    set available_points = available_points + v_release,
        reserved_points = reserved_points - v_job.reserved_points,
        updated_at = now()
    where user_id = v_job.user_id returning * into v_wallet;
  insert into public.sasi_credit_ledger(
    user_id, kind, delta_available, delta_reserved, available_after, reserved_after, reference_id, metadata
  ) values (
    v_job.user_id, 'settle', v_release, -v_job.reserved_points,
    v_wallet.available_points, v_wallet.reserved_points, v_job.id::text,
    jsonb_build_object('actualPoints', p_actual_points, 'releasedPoints', v_release)
  );
  update public.sasi_jobs set
    status = 'succeeded', settled_points = p_actual_points,
    provider_cost_minor = p_provider_cost_minor, output = coalesce(p_output, '{}'::jsonb),
    completed_at = now(), updated_at = now()
    where id = v_job.id;
  if v_job.node_id is not null then
    update public.sasi_nodes set status = 'complete', output = coalesce(p_output, '{}'::jsonb), updated_at = now()
      where id = v_job.node_id;
  end if;
  return jsonb_build_object('ok', true, 'alreadySettled', false,
    'settledPoints', p_actual_points, 'releasedPoints', v_release,
    'availablePoints', v_wallet.available_points, 'reservedPoints', v_wallet.reserved_points);
exception when unique_violation then
  return jsonb_build_object('ok', true, 'alreadySettled', true);
end $$;
revoke execute on function public.settle_sasi_job(uuid, bigint, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.settle_sasi_job(uuid, bigint, bigint, jsonb) to service_role;

create or replace function public.release_sasi_job(p_job_id uuid, p_status text, p_error_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_job public.sasi_jobs%rowtype;
  v_wallet public.sasi_wallets%rowtype;
begin
  if p_status not in ('failed','cancelled') then return jsonb_build_object('ok', false, 'error', 'invalid_status'); end if;
  select * into v_job from public.sasi_jobs where id = p_job_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'job_not_found'); end if;
  if v_job.status in ('failed','cancelled') then return jsonb_build_object('ok', true, 'alreadyReleased', true); end if;
  if v_job.status = 'succeeded' then return jsonb_build_object('ok', false, 'error', 'job_already_settled'); end if;
  select * into v_wallet from public.sasi_wallets where user_id = v_job.user_id for update;
  update public.sasi_wallets
    set available_points = available_points + v_job.reserved_points,
        reserved_points = reserved_points - v_job.reserved_points,
        updated_at = now()
    where user_id = v_job.user_id returning * into v_wallet;
  insert into public.sasi_credit_ledger(
    user_id, kind, delta_available, delta_reserved, available_after, reserved_after, reference_id, metadata
  ) values (
    v_job.user_id, 'release', v_job.reserved_points, -v_job.reserved_points,
    v_wallet.available_points, v_wallet.reserved_points, v_job.id::text,
    jsonb_build_object('reason', coalesce(p_error_code, 'PRODUCTION_FAILED'))
  );
  update public.sasi_jobs set status = p_status, error_code = left(coalesce(p_error_code, 'PRODUCTION_FAILED'), 120),
    completed_at = now(), updated_at = now() where id = v_job.id;
  if v_job.node_id is not null then
    update public.sasi_nodes set status = case when p_status = 'cancelled' then 'ready' else 'failed' end,
      updated_at = now() where id = v_job.node_id;
  end if;
  return jsonb_build_object('ok', true, 'alreadyReleased', false,
    'releasedPoints', v_job.reserved_points,
    'availablePoints', v_wallet.available_points, 'reservedPoints', v_wallet.reserved_points);
exception when unique_violation then
  return jsonb_build_object('ok', true, 'alreadyReleased', true);
end $$;
revoke execute on function public.release_sasi_job(uuid, text, text) from public, anon, authenticated;
grant execute on function public.release_sasi_job(uuid, text, text) to service_role;

commit;
