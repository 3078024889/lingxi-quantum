alter table public.tool_export_grants
  add column if not exists consumed_quantity numeric(12,3) not null default 0;

create table if not exists public.tool_paid_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id uuid not null references public.tool_payment_quotes(id) on delete cascade,
  tool_id text not null,
  item_key text not null,
  units numeric(12,3) not null check (units > 0),
  status text not null default 'processing'
    check (status in ('processing','completed','failed')),
  provider_ref text,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quote_id, item_key)
);

create index if not exists tool_paid_jobs_user_created_idx
  on public.tool_paid_jobs(user_id, created_at desc);

alter table public.tool_paid_jobs enable row level security;

drop policy if exists "users read own paid tool jobs" on public.tool_paid_jobs;
create policy "users read own paid tool jobs"
on public.tool_paid_jobs for select
using (auth.uid() = user_id);

create or replace function public.claim_tool_paid_job(
  p_quote_id uuid,
  p_user_id uuid,
  p_tool_id text,
  p_item_key text,
  p_units numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grant public.tool_export_grants%rowtype;
  v_job public.tool_paid_jobs%rowtype;
begin
  if p_units is null or p_units <= 0 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_UNITS');
  end if;

  select * into v_grant
  from public.tool_export_grants
  where quote_id = p_quote_id and user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'PAID_GRANT_NOT_FOUND');
  end if;

  if v_grant.tool_id <> p_tool_id then
    return jsonb_build_object('ok', false, 'error', 'TOOL_MISMATCH');
  end if;

  select * into v_job
  from public.tool_paid_jobs
  where quote_id = p_quote_id and item_key = p_item_key
  for update;

  if found then
    if v_job.user_id <> p_user_id or v_job.tool_id <> p_tool_id then
      return jsonb_build_object('ok', false, 'error', 'JOB_MISMATCH');
    end if;

    if v_job.status = 'failed' then
      update public.tool_paid_jobs
      set status='processing', error=null, updated_at=now()
      where id=v_job.id;
      return jsonb_build_object('ok', true, 'job_id', v_job.id, 'retry', true, 'status', 'processing');
    end if;

    return jsonb_build_object(
      'ok', true,
      'job_id', v_job.id,
      'existing', true,
      'status', v_job.status,
      'result', v_job.result,
      'provider_ref', v_job.provider_ref
    );
  end if;

  if v_grant.consumed_quantity + p_units > v_grant.quantity then
    return jsonb_build_object(
      'ok', false,
      'error', 'INSUFFICIENT_PAID_UNITS',
      'paid_units', v_grant.quantity,
      'used_units', v_grant.consumed_quantity,
      'requested_units', p_units
    );
  end if;

  update public.tool_export_grants
  set consumed_quantity = consumed_quantity + p_units,
      consumed_at = case when consumed_quantity + p_units >= quantity then now() else consumed_at end
  where id = v_grant.id;

  insert into public.tool_paid_jobs(user_id,quote_id,tool_id,item_key,units,status)
  values(p_user_id,p_quote_id,p_tool_id,p_item_key,p_units,'processing')
  returning * into v_job;

  return jsonb_build_object('ok', true, 'job_id', v_job.id, 'created', true, 'status', 'processing');
end
$$;

create or replace function public.complete_tool_paid_job(
  p_job_id uuid,
  p_result jsonb,
  p_provider_ref text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tool_paid_jobs
  set status='completed',
      result=coalesce(p_result,'{}'::jsonb),
      provider_ref=coalesce(p_provider_ref,provider_ref),
      error=null,
      updated_at=now()
  where id=p_job_id;
end
$$;

create or replace function public.fail_tool_paid_job(
  p_job_id uuid,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tool_paid_jobs
  set status='failed', error=left(coalesce(p_error,'FAILED'),1000), updated_at=now()
  where id=p_job_id;
end
$$;

revoke all on function public.claim_tool_paid_job(uuid,uuid,text,text,numeric) from public, anon, authenticated;
revoke all on function public.complete_tool_paid_job(uuid,jsonb,text) from public, anon, authenticated;
revoke all on function public.fail_tool_paid_job(uuid,text) from public, anon, authenticated;

grant execute on function public.claim_tool_paid_job(uuid,uuid,text,text,numeric) to service_role;
grant execute on function public.complete_tool_paid_job(uuid,jsonb,text) to service_role;
grant execute on function public.fail_tool_paid_job(uuid,text) to service_role;
