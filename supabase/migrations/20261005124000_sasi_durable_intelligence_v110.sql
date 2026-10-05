begin;

create table if not exists public.sasi_durable_runs(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null,
 session_key text not null,
 task text not null,
 idempotency_key text not null,
 input_hash text not null,
 state text not null default 'created' check(state in('created','running','waiting','succeeded','failed','cancelled')),
 current_step text,
 attempt integer not null default 0,
 output_json jsonb,
 error_code text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,idempotency_key)
);
alter table public.sasi_durable_runs enable row level security;
revoke all on public.sasi_durable_runs from anon,authenticated;
create index if not exists sasi_durable_runs_user_session_idx on public.sasi_durable_runs(user_id,session_key,created_at desc);

create table if not exists public.sasi_durable_run_events(
 id bigserial primary key,
 run_id uuid not null references public.sasi_durable_runs(id) on delete cascade,
 kind text not null,
 step text,
 provider_id text,
 latency_ms integer,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.sasi_durable_run_events enable row level security;
revoke all on public.sasi_durable_run_events from anon,authenticated;
create index if not exists sasi_durable_run_events_run_idx on public.sasi_durable_run_events(run_id,id);

create table if not exists public.sasi_ai_trace_spans(
 id bigserial primary key,
 trace_id text not null,
 span_id text not null unique,
 parent_span_id text,
 name text not null,
 status text not null check(status in('ok','error')),
 duration_ms integer not null default 0,
 attributes jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.sasi_ai_trace_spans enable row level security;
revoke all on public.sasi_ai_trace_spans from anon,authenticated;
create index if not exists sasi_ai_trace_spans_trace_idx on public.sasi_ai_trace_spans(trace_id,id);

create or replace function public.begin_sasi_durable_run_v110(
 p_user_id uuid,p_session_key text,p_task text,p_input_hash text,p_idempotency_key text
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_runs%rowtype;
begin
 if p_user_id is null or coalesce(length(p_session_key),0)<1 or coalesce(length(p_task),0)<1 or coalesce(length(p_idempotency_key),0)<8 then
  return jsonb_build_object('ok',false,'error','INVALID_DURABLE_RUN');
 end if;
 insert into public.sasi_durable_runs(user_id,session_key,task,idempotency_key,input_hash)
 values(p_user_id,left(p_session_key,160),left(p_task,80),left(p_idempotency_key,160),left(p_input_hash,128))
 on conflict(user_id,idempotency_key) do nothing;
 select * into r from public.sasi_durable_runs where user_id=p_user_id and idempotency_key=left(p_idempotency_key,160) for update;
 if r.input_hash<>left(p_input_hash,128) then return jsonb_build_object('ok',false,'error','IDEMPOTENCY_INPUT_MISMATCH'); end if;
 return jsonb_build_object('ok',true,'id',r.id,'state',r.state,'current_step',r.current_step,'attempt',r.attempt,'output_json',r.output_json,'error_code',r.error_code);
end $$;

create or replace function public.checkpoint_sasi_durable_run_v110(
 p_run_id uuid,p_step text,p_state text,p_payload jsonb default null,p_error_code text default null
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_durable_runs%rowtype;
begin
 select * into r from public.sasi_durable_runs where id=p_run_id for update;
 if not found then return jsonb_build_object('ok',false,'error','RUN_NOT_FOUND'); end if;
 if r.state in('succeeded','cancelled') and p_state<>r.state then
  return jsonb_build_object('ok',false,'error','TERMINAL_STATE');
 end if;
 update public.sasi_durable_runs set
  state=p_state,current_step=left(coalesce(p_step,''),120),
  attempt=case when p_state='running' then attempt+1 else attempt end,
  output_json=case when p_state='succeeded' then p_payload else output_json end,
  error_code=p_error_code,updated_at=now()
 where id=p_run_id returning * into r;
 insert into public.sasi_durable_run_events(run_id,kind,step,metadata)
 values(p_run_id,'checkpoint',left(coalesce(p_step,''),120),jsonb_build_object('state',p_state,'attempt',r.attempt));
 return jsonb_build_object('ok',true,'state',r.state,'attempt',r.attempt);
end $$;

revoke all on function public.begin_sasi_durable_run_v110(uuid,text,text,text,text) from public,anon,authenticated;
revoke all on function public.checkpoint_sasi_durable_run_v110(uuid,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.begin_sasi_durable_run_v110(uuid,text,text,text,text) to service_role;
grant execute on function public.checkpoint_sasi_durable_run_v110(uuid,text,text,jsonb,text) to service_role;

commit;
