begin;

create table if not exists public.sasi_durable_step_results(
 id uuid primary key default gen_random_uuid(),
 run_id uuid not null references public.sasi_durable_runs(id) on delete cascade,
 step_id text not null,
 input_hash text not null,
 state text not null default 'running' check(state in('running','succeeded','failed')),
 attempt integer not null default 1,
 lease_until timestamptz,
 output_json jsonb,
 error_code text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(run_id,step_id,input_hash)
);
alter table public.sasi_durable_step_results enable row level security;
revoke all on public.sasi_durable_step_results from anon,authenticated;
create index if not exists sasi_durable_step_results_run_idx on public.sasi_durable_step_results(run_id,updated_at desc);

create or replace function public.claim_sasi_durable_step_v140(
 p_run_id uuid,p_step_id text,p_input_hash text,p_lease_seconds integer default 45
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_step_results%rowtype; inserted boolean:=false;
begin
 if p_run_id is null or coalesce(length(p_step_id),0)<1 or coalesce(length(p_input_hash),0)<16 then
  return jsonb_build_object('ok',false,'error','INVALID_DURABLE_STEP');
 end if;
 insert into public.sasi_durable_step_results(run_id,step_id,input_hash,state,attempt,lease_until)
 values(p_run_id,left(p_step_id,160),left(p_input_hash,128),'running',1,now()+make_interval(secs=>greatest(15,least(120,p_lease_seconds))))
 on conflict(run_id,step_id,input_hash) do nothing
 returning * into r;
 if found then inserted:=true; end if;

 if not inserted then
  select * into r from public.sasi_durable_step_results
   where run_id=p_run_id and step_id=left(p_step_id,160) and input_hash=left(p_input_hash,128)
   for update;
  if r.state='succeeded' then
   return jsonb_build_object('ok',true,'claimed',false,'replayed',true,'state',r.state,'attempt',r.attempt,'output_json',r.output_json);
  end if;
  if r.state='running' and r.lease_until is not null and r.lease_until>now() then
   return jsonb_build_object('ok',true,'claimed',false,'replayed',false,'state',r.state,'attempt',r.attempt);
  end if;
  update public.sasi_durable_step_results set
   state='running',attempt=attempt+1,lease_until=now()+make_interval(secs=>greatest(15,least(120,p_lease_seconds))),
   error_code=null,updated_at=now()
  where id=r.id returning * into r;
 end if;

 return jsonb_build_object('ok',true,'claimed',true,'replayed',false,'state',r.state,'attempt',r.attempt);
end $$;

create or replace function public.complete_sasi_durable_step_v140(
 p_run_id uuid,p_step_id text,p_input_hash text,p_output jsonb
) returns jsonb
language plpgsql security definer set search_path=public as $$
begin
 update public.sasi_durable_step_results set
  state='succeeded',output_json=p_output,lease_until=null,error_code=null,updated_at=now()
 where run_id=p_run_id and step_id=left(p_step_id,160) and input_hash=left(p_input_hash,128);
 if not found then return jsonb_build_object('ok',false,'error','STEP_NOT_FOUND'); end if;
 return jsonb_build_object('ok',true,'state','succeeded');
end $$;

create or replace function public.fail_sasi_durable_step_v140(
 p_run_id uuid,p_step_id text,p_input_hash text,p_error_code text
) returns jsonb
language plpgsql security definer set search_path=public as $$
begin
 update public.sasi_durable_step_results set
  state='failed',lease_until=null,error_code=left(coalesce(p_error_code,'STEP_FAILED'),160),updated_at=now()
 where run_id=p_run_id and step_id=left(p_step_id,160) and input_hash=left(p_input_hash,128);
 if not found then return jsonb_build_object('ok',false,'error','STEP_NOT_FOUND'); end if;
 return jsonb_build_object('ok',true,'state','failed');
end $$;

revoke all on function public.claim_sasi_durable_step_v140(uuid,text,text,integer) from public,anon,authenticated;
revoke all on function public.complete_sasi_durable_step_v140(uuid,text,text,jsonb) from public,anon,authenticated;
revoke all on function public.fail_sasi_durable_step_v140(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.claim_sasi_durable_step_v140(uuid,text,text,integer) to service_role;
grant execute on function public.complete_sasi_durable_step_v140(uuid,text,text,jsonb) to service_role;
grant execute on function public.fail_sasi_durable_step_v140(uuid,text,text,text) to service_role;

commit;
