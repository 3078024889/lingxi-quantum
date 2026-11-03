begin;

create table if not exists public.sasi_durable_jobs(
 id uuid primary key default gen_random_uuid(),
 run_id uuid not null references public.sasi_durable_runs(id) on delete cascade,
 user_id uuid not null,
 job_kind text not null,
 workflow_version text not null,
 payload_json jsonb not null,
 state text not null default 'queued' check(state in('queued','running','waiting','succeeded','failed','cancelled')),
 priority smallint not null default 0 check(priority between 0 and 9),
 attempt integer not null default 0,
 max_attempts integer not null default 4 check(max_attempts between 1 and 12),
 available_at timestamptz not null default now(),
 deadline_at timestamptz,
 lease_owner text,
 lease_until timestamptz,
 error_code text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(run_id,job_kind,workflow_version)
);
alter table public.sasi_durable_jobs enable row level security;
revoke all on public.sasi_durable_jobs from anon,authenticated;
create index if not exists sasi_durable_jobs_claim_idx
 on public.sasi_durable_jobs(state,available_at,priority desc,created_at);

create or replace function public.enqueue_sasi_durable_job_v150(
 p_run_id uuid,p_user_id uuid,p_job_kind text,p_workflow_version text,p_payload jsonb,
 p_priority integer default 0,p_max_attempts integer default 4,p_deadline_at timestamptz default null
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_jobs%rowtype;
begin
 if p_run_id is null or p_user_id is null or coalesce(length(p_job_kind),0)<1 or coalesce(length(p_workflow_version),0)<1 then
  return jsonb_build_object('ok',false,'error','INVALID_JOB');
 end if;
 if pg_column_size(coalesce(p_payload,'{}'::jsonb)) > 131072 then
  return jsonb_build_object('ok',false,'error','JOB_PAYLOAD_TOO_LARGE');
 end if;
 insert into public.sasi_durable_jobs(
  run_id,user_id,job_kind,workflow_version,payload_json,priority,max_attempts,deadline_at
 ) values(
  p_run_id,p_user_id,left(p_job_kind,120),left(p_workflow_version,80),coalesce(p_payload,'{}'::jsonb),
  greatest(0,least(9,p_priority)),greatest(1,least(12,p_max_attempts)),p_deadline_at
 )
 on conflict(run_id,job_kind,workflow_version) do nothing;

 select * into r from public.sasi_durable_jobs
 where run_id=p_run_id and job_kind=left(p_job_kind,120) and workflow_version=left(p_workflow_version,80);

 return jsonb_build_object(
  'ok',true,'id',r.id,'state',r.state,'attempt',r.attempt,
  'workflow_version',r.workflow_version,'created_at',r.created_at
 );
end $$;

create or replace function public.claim_sasi_durable_job_v150(
 p_worker_id text,p_lease_seconds integer default 75
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_jobs%rowtype;
begin
 update public.sasi_durable_jobs set
  state='failed',error_code='DEADLINE_EXPIRED',lease_owner=null,lease_until=null,updated_at=now()
 where state in('queued','waiting')
   and deadline_at is not null and deadline_at <= now();

 select * into r from public.sasi_durable_jobs
 where state in('queued','waiting')
   and available_at<=now()
   and (deadline_at is null or deadline_at>now())
   and (lease_until is null or lease_until<=now())
 order by
   (priority + least(9,floor(extract(epoch from(now()-created_at))/300)::int)) desc,
   available_at asc,created_at asc
 for update skip locked
 limit 1;

 if not found then return jsonb_build_object('ok',true,'claimed',false); end if;

 update public.sasi_durable_jobs set
  state='running',
  attempt=attempt+1,
  lease_owner=left(coalesce(p_worker_id,'worker'),160),
  lease_until=now()+make_interval(secs=>greatest(30,least(180,p_lease_seconds))),
  updated_at=now()
 where id=r.id returning * into r;

 return jsonb_build_object(
  'ok',true,'claimed',true,'id',r.id,'run_id',r.run_id,'user_id',r.user_id,
  'job_kind',r.job_kind,'workflow_version',r.workflow_version,'payload_json',r.payload_json,
  'attempt',r.attempt,'max_attempts',r.max_attempts,'lease_until',r.lease_until
 );
end $$;

create or replace function public.renew_sasi_durable_job_lease_v150(
 p_job_id uuid,p_worker_id text,p_lease_seconds integer default 75
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_jobs%rowtype;
begin
 update public.sasi_durable_jobs set
  lease_until=now()+make_interval(secs=>greatest(30,least(180,p_lease_seconds))),
  updated_at=now()
 where id=p_job_id and state='running' and lease_owner=left(coalesce(p_worker_id,''),160)
 returning * into r;
 if not found then return jsonb_build_object('ok',false,'error','LEASE_LOST'); end if;
 return jsonb_build_object('ok',true,'lease_until',r.lease_until);
end $$;

create or replace function public.complete_sasi_durable_job_v150(
 p_job_id uuid,p_worker_id text
) returns jsonb
language plpgsql security definer set search_path=public as $$
begin
 update public.sasi_durable_jobs set
  state='succeeded',lease_owner=null,lease_until=null,error_code=null,updated_at=now()
 where id=p_job_id and state='running' and lease_owner=left(coalesce(p_worker_id,''),160);
 if not found then return jsonb_build_object('ok',false,'error','LEASE_LOST_OR_TERMINAL'); end if;
 return jsonb_build_object('ok',true,'state','succeeded');
end $$;

create or replace function public.fail_sasi_durable_job_v150(
 p_job_id uuid,p_worker_id text,p_error_code text,p_retryable boolean default true
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_jobs%rowtype; delay_seconds integer;
begin
 select * into r from public.sasi_durable_jobs
 where id=p_job_id and state='running' and lease_owner=left(coalesce(p_worker_id,''),160)
 for update;
 if not found then return jsonb_build_object('ok',false,'error','LEASE_LOST_OR_TERMINAL'); end if;

 if p_retryable and r.attempt<r.max_attempts and (r.deadline_at is null or r.deadline_at>now()) then
  delay_seconds=least(300,(power(2,greatest(0,r.attempt-1))*5)::int);
  update public.sasi_durable_jobs set
   state='waiting',available_at=now()+make_interval(secs=>delay_seconds),
   lease_owner=null,lease_until=null,error_code=left(coalesce(p_error_code,'JOB_FAILED'),160),updated_at=now()
  where id=r.id;
  return jsonb_build_object('ok',true,'state','waiting','retry_in_seconds',delay_seconds);
 end if;

 update public.sasi_durable_jobs set
  state='failed',lease_owner=null,lease_until=null,error_code=left(coalesce(p_error_code,'JOB_FAILED'),160),updated_at=now()
 where id=r.id;
 return jsonb_build_object('ok',true,'state','failed');
end $$;

create or replace function public.cancel_sasi_durable_job_v150(
 p_run_id uuid,p_user_id uuid
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 update public.sasi_durable_jobs set
  state='cancelled',lease_owner=null,lease_until=null,error_code='USER_CANCELLED',updated_at=now()
 where run_id=p_run_id and user_id=p_user_id and state in('queued','waiting','running');
 get diagnostics n = row_count;
 return jsonb_build_object('ok',true,'cancelled',n);
end $$;

revoke all on function public.enqueue_sasi_durable_job_v150(uuid,uuid,text,text,jsonb,integer,integer,timestamptz) from public,anon,authenticated;
revoke all on function public.claim_sasi_durable_job_v150(text,integer) from public,anon,authenticated;
revoke all on function public.renew_sasi_durable_job_lease_v150(uuid,text,integer) from public,anon,authenticated;
revoke all on function public.complete_sasi_durable_job_v150(uuid,text) from public,anon,authenticated;
revoke all on function public.fail_sasi_durable_job_v150(uuid,text,text,boolean) from public,anon,authenticated;
revoke all on function public.cancel_sasi_durable_job_v150(uuid,uuid) from public,anon,authenticated;

grant execute on function public.enqueue_sasi_durable_job_v150(uuid,uuid,text,text,jsonb,integer,integer,timestamptz) to service_role;
grant execute on function public.claim_sasi_durable_job_v150(text,integer) to service_role;
grant execute on function public.renew_sasi_durable_job_lease_v150(uuid,text,integer) to service_role;
grant execute on function public.complete_sasi_durable_job_v150(uuid,text) to service_role;
grant execute on function public.fail_sasi_durable_job_v150(uuid,text,text,boolean) to service_role;
grant execute on function public.cancel_sasi_durable_job_v150(uuid,uuid) to service_role;

commit;
