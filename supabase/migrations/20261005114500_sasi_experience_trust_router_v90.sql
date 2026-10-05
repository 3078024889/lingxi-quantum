begin;

create table if not exists public.sasi_experience_daily(
 user_id uuid not null,
 usage_day date not null default current_date,
 used_units integer not null default 0 check(used_units>=0),
 reserved_units integer not null default 0 check(reserved_units>=0),
 updated_at timestamptz not null default now(),
 primary key(user_id,usage_day)
);
alter table public.sasi_experience_daily enable row level security;
revoke all on public.sasi_experience_daily from anon,authenticated;

create table if not exists public.sasi_experience_reservations(
 reference_id text primary key,
 user_id uuid not null,
 usage_day date not null default current_date,
 units integer not null check(units>0),
 state text not null default 'reserved' check(state in('reserved','settled','released')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.sasi_experience_reservations enable row level security;
revoke all on public.sasi_experience_reservations from anon,authenticated;
create index if not exists sasi_experience_reservations_user_day_idx on public.sasi_experience_reservations(user_id,usage_day);

create table if not exists public.sasi_experience_provider_daily(
 provider_id text not null,
 usage_day date not null default current_date,
 request_count integer not null default 0,
 success_count integer not null default 0,
 failure_count integer not null default 0,
 estimated_tokens bigint not null default 0,
 latency_ewma_ms integer,
 cooldown_until timestamptz,
 updated_at timestamptz not null default now(),
 primary key(provider_id,usage_day)
);
alter table public.sasi_experience_provider_daily enable row level security;
revoke all on public.sasi_experience_provider_daily from anon,authenticated;

create or replace function public.reserve_sasi_experience_v90(
 p_user_id uuid,p_reference_id text,p_units integer,p_daily_limit integer
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r public.sasi_experience_daily%rowtype; existing public.sasi_experience_reservations%rowtype;
begin
 if p_user_id is null or coalesce(length(p_reference_id),0)<8 or p_units<=0 or p_daily_limit<=0 then
  return jsonb_build_object('ok',false,'error','INVALID_EXPERIENCE_RESERVATION','remaining_units',0);
 end if;
 select * into existing from public.sasi_experience_reservations where reference_id=p_reference_id;
 if found then
  return jsonb_build_object('ok',existing.state in('reserved','settled'),'alreadyExists',true,'remaining_units',0);
 end if;
 insert into public.sasi_experience_daily(user_id,usage_day) values(p_user_id,current_date) on conflict do nothing;
 select * into r from public.sasi_experience_daily where user_id=p_user_id and usage_day=current_date for update;
 if r.used_units+r.reserved_units+p_units>p_daily_limit then
  return jsonb_build_object('ok',false,'error','EXPERIENCE_EXHAUSTED','remaining_units',greatest(0,p_daily_limit-r.used_units-r.reserved_units));
 end if;
 update public.sasi_experience_daily set reserved_units=reserved_units+p_units,updated_at=now() where user_id=p_user_id and usage_day=current_date;
 insert into public.sasi_experience_reservations(reference_id,user_id,usage_day,units) values(p_reference_id,p_user_id,current_date,p_units);
 return jsonb_build_object('ok',true,'remaining_units',greatest(0,p_daily_limit-r.used_units-r.reserved_units-p_units));
end $$;

create or replace function public.settle_sasi_experience_v90(p_reference_id text,p_success boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare x public.sasi_experience_reservations%rowtype;
begin
 select * into x from public.sasi_experience_reservations where reference_id=p_reference_id for update;
 if not found then return jsonb_build_object('ok',false,'error','RESERVATION_NOT_FOUND'); end if;
 if x.state<>'reserved' then return jsonb_build_object('ok',true,'alreadySettled',true); end if;
 update public.sasi_experience_daily
 set reserved_units=greatest(0,reserved_units-x.units),
     used_units=used_units+case when p_success then x.units else 0 end,
     updated_at=now()
 where user_id=x.user_id and usage_day=x.usage_day;
 update public.sasi_experience_reservations set state=case when p_success then 'settled' else 'released' end,updated_at=now() where reference_id=p_reference_id;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.record_sasi_experience_provider_run_v90(
 p_provider_id text,p_ok boolean,p_estimated_tokens integer,p_latency_ms integer,p_cooldown_seconds integer default 0
) returns void language plpgsql security definer set search_path=public as $$
begin
 insert into public.sasi_experience_provider_daily(provider_id,usage_day,request_count,success_count,failure_count,estimated_tokens,latency_ewma_ms,cooldown_until)
 values(p_provider_id,current_date,1,case when p_ok then 1 else 0 end,case when p_ok then 0 else 1 end,greatest(0,p_estimated_tokens),greatest(0,p_latency_ms),case when p_cooldown_seconds>0 then now()+make_interval(secs=>p_cooldown_seconds) end)
 on conflict(provider_id,usage_day) do update set
  request_count=public.sasi_experience_provider_daily.request_count+1,
  success_count=public.sasi_experience_provider_daily.success_count+case when p_ok then 1 else 0 end,
  failure_count=public.sasi_experience_provider_daily.failure_count+case when p_ok then 0 else 1 end,
  estimated_tokens=public.sasi_experience_provider_daily.estimated_tokens+greatest(0,p_estimated_tokens),
  latency_ewma_ms=case when public.sasi_experience_provider_daily.latency_ewma_ms is null then greatest(0,p_latency_ms) else round(public.sasi_experience_provider_daily.latency_ewma_ms*.75+greatest(0,p_latency_ms)*.25)::integer end,
  cooldown_until=case when p_cooldown_seconds>0 then greatest(coalesce(public.sasi_experience_provider_daily.cooldown_until,now()),now()+make_interval(secs=>p_cooldown_seconds)) else public.sasi_experience_provider_daily.cooldown_until end,
  updated_at=now();
end $$;

revoke all on function public.reserve_sasi_experience_v90(uuid,text,integer,integer) from public,anon,authenticated;
revoke all on function public.settle_sasi_experience_v90(text,boolean) from public,anon,authenticated;
revoke all on function public.record_sasi_experience_provider_run_v90(text,boolean,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.reserve_sasi_experience_v90(uuid,text,integer,integer) to service_role;
grant execute on function public.settle_sasi_experience_v90(text,boolean) to service_role;
grant execute on function public.record_sasi_experience_provider_run_v90(text,boolean,integer,integer,integer) to service_role;

commit;
