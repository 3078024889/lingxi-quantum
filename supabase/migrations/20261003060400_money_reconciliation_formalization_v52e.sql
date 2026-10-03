alter table public.balance_withdrawals
  add column if not exists provider_request_key text,
  add column if not exists provider_attempt_count integer not null default 0,
  add column if not exists last_provider_checked_at timestamptz,
  add column if not exists next_reconcile_at timestamptz,
  add column if not exists provider_raw_status text,
  add column if not exists last_provider_error_code text;

update public.balance_withdrawals
set provider_request_key='lf-refund-'||id::text
where provider_request_key is null;

alter table public.balance_withdrawals
  alter column provider_request_key set not null;

create unique index if not exists balance_withdrawals_provider_request_key_uidx
  on public.balance_withdrawals(provider_request_key);

create index if not exists balance_withdrawals_reconcile_idx
  on public.balance_withdrawals(status,next_reconcile_at,created_at)
  where status in ('requested','processing');

create or replace function public.money_claim_reconciliation_v52e(
  p_limit integer default 20,
  p_lease_seconds integer default 300
)
returns table(id uuid)
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
    select bw.id
    from public.balance_withdrawals bw
    where bw.status in ('requested','processing')
      and bw.completed_at is null
      and coalesce(bw.next_reconcile_at,bw.created_at)<=now()
    order by coalesce(bw.next_reconcile_at,bw.created_at),bw.created_at
    for update skip locked
    limit greatest(1,least(coalesce(p_limit,20),100))
  ),
  leased as (
    update public.balance_withdrawals bw
    set next_reconcile_at=now()+make_interval(secs=>greatest(30,least(coalesce(p_lease_seconds,300),1800))),
        updated_at=now()
    where bw.id in (select due.id from due)
    returning bw.id
  )
  select leased.id from leased;
end
$$;

revoke all on function public.money_claim_reconciliation_v52e(integer,integer) from public;
grant execute on function public.money_claim_reconciliation_v52e(integer,integer) to service_role;
