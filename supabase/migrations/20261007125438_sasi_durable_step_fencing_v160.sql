begin;

alter table public.sasi_durable_step_results
 add column if not exists lease_owner text,
 add column if not exists fence_token bigint not null default 0;

create or replace function public.claim_sasi_durable_step_v160(
 p_run_id uuid,p_step_id text,p_input_hash text,p_worker_id text,p_lease_seconds integer default 45
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_step_results%rowtype; inserted boolean:=false;
begin
 if p_run_id is null or coalesce(length(p_step_id),0)<1 or coalesce(length(p_input_hash),0)<16 or coalesce(length(p_worker_id),0)<1 then
  return jsonb_build_object('ok',false,'error','INVALID_DURABLE_STEP');
 end if;

 insert into public.sasi_durable_step_results(
  run_id,step_id,input_hash,state,attempt,lease_until,lease_owner,fence_token
 ) values(
  p_run_id,left(p_step_id,160),left(p_input_hash,128),'running',1,
  now()+make_interval(secs=>greatest(15,least(120,p_lease_seconds))),
  left(p_worker_id,160),1
 )
 on conflict(run_id,step_id,input_hash) do nothing
 returning * into r;
 if found then inserted:=true; end if;

 if not inserted then
  select * into r from public.sasi_durable_step_results
   where run_id=p_run_id and step_id=left(p_step_id,160) and input_hash=left(p_input_hash,128)
   for update;

  if r.state='succeeded' then
   return jsonb_build_object(
    'ok',true,'claimed',false,'replayed',true,'state',r.state,'attempt',r.attempt,
    'output_json',r.output_json,'fence_token',r.fence_token
   );
  end if;

  if r.state='running' and r.lease_until is not null and r.lease_until>now() then
   return jsonb_build_object(
    'ok',true,'claimed',false,'replayed',false,'state',r.state,'attempt',r.attempt
   );
  end if;

  update public.sasi_durable_step_results set
   state='running',
   attempt=attempt+1,
   lease_until=now()+make_interval(secs=>greatest(15,least(120,p_lease_seconds))),
   lease_owner=left(p_worker_id,160),
   fence_token=fence_token+1,
   error_code=null,
   updated_at=now()
  where id=r.id returning * into r;
 end if;

 return jsonb_build_object(
  'ok',true,'claimed',true,'replayed',false,'state',r.state,'attempt',r.attempt,
  'fence_token',r.fence_token
 );
end $$;

create or replace function public.renew_sasi_durable_step_lease_v160(
 p_run_id uuid,p_step_id text,p_input_hash text,p_worker_id text,p_fence_token bigint,p_lease_seconds integer default 45
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_step_results%rowtype;
begin
 update public.sasi_durable_step_results set
  lease_until=now()+make_interval(secs=>greatest(15,least(120,p_lease_seconds))),
  updated_at=now()
 where run_id=p_run_id
   and step_id=left(p_step_id,160)
   and input_hash=left(p_input_hash,128)
   and state='running'
   and lease_owner=left(p_worker_id,160)
   and fence_token=p_fence_token
 returning * into r;
 if not found then return jsonb_build_object('ok',false,'error','STEP_FENCE_LOST'); end if;
 return jsonb_build_object('ok',true,'lease_until',r.lease_until,'fence_token',r.fence_token);
end $$;

create or replace function public.complete_sasi_durable_step_v160(
 p_run_id uuid,p_step_id text,p_input_hash text,p_worker_id text,p_fence_token bigint,p_output jsonb
) returns jsonb
language plpgsql security definer set search_path=public as $$
begin
 update public.sasi_durable_step_results set
  state='succeeded',output_json=p_output,lease_until=null,lease_owner=null,error_code=null,updated_at=now()
 where run_id=p_run_id
   and step_id=left(p_step_id,160)
   and input_hash=left(p_input_hash,128)
   and state='running'
   and lease_owner=left(p_worker_id,160)
   and fence_token=p_fence_token;
 if not found then return jsonb_build_object('ok',false,'error','STEP_FENCE_LOST'); end if;
 return jsonb_build_object('ok',true,'state','succeeded');
end $$;

create or replace function public.fail_sasi_durable_step_v160(
 p_run_id uuid,p_step_id text,p_input_hash text,p_worker_id text,p_fence_token bigint,p_error_code text
) returns jsonb
language plpgsql security definer set search_path=public as $$
begin
 update public.sasi_durable_step_results set
  state='failed',lease_until=null,lease_owner=null,error_code=left(coalesce(p_error_code,'STEP_FAILED'),160),updated_at=now()
 where run_id=p_run_id
   and step_id=left(p_step_id,160)
   and input_hash=left(p_input_hash,128)
   and state='running'
   and lease_owner=left(p_worker_id,160)
   and fence_token=p_fence_token;
 if not found then return jsonb_build_object('ok',false,'error','STEP_FENCE_LOST'); end if;
 return jsonb_build_object('ok',true,'state','failed');
end $$;

revoke all on function public.claim_sasi_durable_step_v160(uuid,text,text,text,integer) from public,anon,authenticated;
revoke all on function public.renew_sasi_durable_step_lease_v160(uuid,text,text,text,bigint,integer) from public,anon,authenticated;
revoke all on function public.complete_sasi_durable_step_v160(uuid,text,text,text,bigint,jsonb) from public,anon,authenticated;
revoke all on function public.fail_sasi_durable_step_v160(uuid,text,text,text,bigint,text) from public,anon,authenticated;

grant execute on function public.claim_sasi_durable_step_v160(uuid,text,text,text,integer) to service_role;
grant execute on function public.renew_sasi_durable_step_lease_v160(uuid,text,text,text,bigint,integer) to service_role;
grant execute on function public.complete_sasi_durable_step_v160(uuid,text,text,text,bigint,jsonb) to service_role;
grant execute on function public.fail_sasi_durable_step_v160(uuid,text,text,text,bigint,text) to service_role;

commit;
