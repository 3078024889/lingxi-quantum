begin;
-- Supplier rendering and media memory contention are waits, not failed retries.
create or replace function public.defer_sasi_video_poll_v78(p_job_id uuid,p_worker_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_jobs%rowtype;
begin
 select * into r from public.sasi_durable_jobs where id=p_job_id
 and job_kind in ('video.advance','video.compose') and state='running' and lease_until>now()
 and lease_owner=left(coalesce(p_worker_id,''),160) for update;
 if not found then return jsonb_build_object('ok',false,'error','LEASE_LOST_OR_TERMINAL');end if;
 if r.deadline_at is null or r.deadline_at<=now() then
  update public.sasi_durable_jobs set state='failed',error_code='VIDEO_POLL_DEADLINE',lease_owner=null,lease_until=null,updated_at=now() where id=r.id;
  return jsonb_build_object('ok',true,'state','failed');
 end if;
 update public.sasi_durable_jobs set state='waiting',available_at=now()+interval '30 seconds',
 attempt=greatest(0,attempt-1),priority=case when job_kind='video.advance' then greatest(priority,3) else priority end,
 lease_owner=null,lease_until=null,error_code=null,updated_at=now() where id=r.id;
 return jsonb_build_object('ok',true,'state','waiting');
end $$;
revoke all on function public.defer_sasi_video_poll_v78(uuid,text) from public,anon,authenticated;
grant execute on function public.defer_sasi_video_poll_v78(uuid,text) to service_role;
commit;
