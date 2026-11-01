begin;
create or replace function public.claim_sasi_durable_job_v150(
 p_worker_id text,p_lease_seconds integer default 75
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_jobs%rowtype;
begin
 -- A crashed worker must not leave the task running forever. Do not repeat
 -- a provider submission whose outcome is unknown after losing the lease.
 with abandoned as (
  update public.sasi_durable_jobs set
   state='failed',error_code='WORKER_LEASE_EXPIRED_REVIEW_REQUIRED',
   lease_owner=null,lease_until=null,updated_at=now()
  where state='running' and lease_until is not null and lease_until<=now()
  returning run_id
 )
 update public.sasi_durable_runs set
  state='failed',error_code='WORKER_LEASE_EXPIRED_REVIEW_REQUIRED',updated_at=now()
 where id in(select run_id from abandoned) and state not in('succeeded','cancelled');

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
revoke all on function public.claim_sasi_durable_job_v150(text,integer) from public,anon,authenticated;
grant execute on function public.claim_sasi_durable_job_v150(text,integer) to service_role;
commit;