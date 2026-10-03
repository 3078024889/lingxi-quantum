create table if not exists public.money_webhook_inbox (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('wechat','paypal','alipay')),
  event_key text not null,
  event_type text not null,
  object_key text,
  payload jsonb not null default '{}'::jsonb,
  payload_hash text not null,
  status text not null default 'received' check (status in ('received','processing','processed','dead_letter')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null default now(),
  locked_until timestamptz,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,event_key)
);

alter table public.money_webhook_inbox enable row level security;
revoke all on table public.money_webhook_inbox from public,anon,authenticated;
grant all on table public.money_webhook_inbox to service_role;

create index if not exists money_webhook_inbox_claim_idx
  on public.money_webhook_inbox(status,available_at,locked_until,created_at)
  where status in ('received','processing');

create index if not exists money_webhook_inbox_object_idx
  on public.money_webhook_inbox(provider,object_key,created_at desc);

create or replace function public.money_enqueue_webhook_event_v53(
  p_provider text,
  p_event_key text,
  p_event_type text,
  p_object_key text,
  p_payload jsonb,
  p_payload_hash text
)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  existing public.money_webhook_inbox%rowtype;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'service_role required';
  end if;
  if p_provider not in ('wechat','paypal','alipay')
     or coalesce(length(trim(p_event_key)),0)=0
     or coalesce(length(trim(p_event_type)),0)=0
     or coalesce(length(trim(p_payload_hash)),0)=0 then
    return jsonb_build_object('ok',false,'error','INVALID_WEBHOOK_EVENT');
  end if;

  insert into public.money_webhook_inbox(
    provider,event_key,event_type,object_key,payload,payload_hash
  ) values(
    p_provider,left(trim(p_event_key),200),left(trim(p_event_type),160),
    nullif(left(coalesce(trim(p_object_key),''),200),''),
    coalesce(p_payload,'{}'::jsonb),left(trim(p_payload_hash),128)
  )
  on conflict(provider,event_key) do nothing;

  select * into existing
  from public.money_webhook_inbox
  where provider=p_provider and event_key=left(trim(p_event_key),200);

  if existing.payload_hash<>left(trim(p_payload_hash),128) then
    return jsonb_build_object('ok',false,'error','WEBHOOK_EVENT_HASH_CONFLICT','eventId',existing.id);
  end if;

  return jsonb_build_object('ok',true,'eventId',existing.id,'status',existing.status);
end
$$;

revoke all on function public.money_enqueue_webhook_event_v53(text,text,text,text,jsonb,text) from public;
grant execute on function public.money_enqueue_webhook_event_v53(text,text,text,text,jsonb,text) to service_role;

create or replace function public.money_claim_webhook_events_v53(
  p_limit integer default 30,
  p_lease_seconds integer default 120
)
returns table(
  id uuid,
  provider text,
  event_key text,
  event_type text,
  object_key text,
  payload jsonb,
  attempt_count integer
)
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'service_role required';
  end if;

  return query
  with due as (
    select i.id
    from public.money_webhook_inbox i
    where i.status in ('received','processing')
      and i.available_at<=now()
      and (i.locked_until is null or i.locked_until<=now())
    order by i.created_at
    for update skip locked
    limit greatest(1,least(coalesce(p_limit,30),100))
  ),
  leased as (
    update public.money_webhook_inbox i
    set status='processing',
        locked_until=now()+make_interval(secs=>greatest(30,least(coalesce(p_lease_seconds,120),900))),
        attempt_count=i.attempt_count+1,
        updated_at=now()
    where i.id in (select due.id from due)
    returning i.id,i.provider,i.event_key,i.event_type,i.object_key,i.payload,i.attempt_count
  )
  select leased.id,leased.provider,leased.event_key,leased.event_type,leased.object_key,leased.payload,leased.attempt_count
  from leased;
end
$$;

revoke all on function public.money_claim_webhook_events_v53(integer,integer) from public;
grant execute on function public.money_claim_webhook_events_v53(integer,integer) to service_role;

create or replace function public.money_finish_webhook_event_v53(
  p_id uuid,
  p_outcome text,
  p_last_error text default null,
  p_retry_seconds integer default 300
)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'service_role required';
  end if;

  if p_outcome='processed' then
    update public.money_webhook_inbox
    set status='processed',processed_at=now(),locked_until=null,last_error=null,updated_at=now()
    where id=p_id;
  elsif p_outcome='retry' then
    update public.money_webhook_inbox
    set status='received',
        available_at=now()+make_interval(secs=>greatest(30,least(coalesce(p_retry_seconds,300),86400))),
        locked_until=null,
        last_error=left(coalesce(p_last_error,'WEBHOOK_RETRY'),240),
        updated_at=now()
    where id=p_id;
  elsif p_outcome='dead_letter' then
    update public.money_webhook_inbox
    set status='dead_letter',locked_until=null,
        last_error=left(coalesce(p_last_error,'WEBHOOK_DEAD_LETTER'),240),
        updated_at=now()
    where id=p_id;
  else
    return jsonb_build_object('ok',false,'error','INVALID_OUTCOME');
  end if;

  return jsonb_build_object('ok',true,'outcome',p_outcome);
end
$$;

revoke all on function public.money_finish_webhook_event_v53(uuid,text,text,integer) from public;
grant execute on function public.money_finish_webhook_event_v53(uuid,text,text,integer) to service_role;
