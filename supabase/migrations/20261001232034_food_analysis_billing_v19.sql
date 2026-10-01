-- Immutable server-calculated meals. No browser role may read unpaid results.
create table public.food_analysis_requests_v19 (
 id uuid primary key,
 account_id uuid references auth.users(id) on delete cascade,
 ip_hash text not null check(length(ip_hash)=64),
 mode text not null check(mode in ('image','custom')),
 quantity integer not null check(quantity between 1 and 30),
 free_eligible boolean not null,
 image_session_id uuid references public.food_calorie_image_sessions_v18(id),
 input_digest text not null check(length(input_digest)=64),
 result jsonb not null check(jsonb_typeof(result)='object'),
 quote_id uuid unique references public.tool_payment_quotes(id),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '24 hours',
 consumed_at timestamptz,
 check((mode='custom' and image_session_id is null and free_eligible) or (mode='image' and image_session_id is not null and free_eligible=(quantity=1)))
);
alter table public.food_analysis_requests_v19 enable row level security;
revoke all on public.food_analysis_requests_v19 from public,anon,authenticated;
grant select,insert,update,delete on public.food_analysis_requests_v19 to service_role;
create index food_analysis_account_v19 on public.food_analysis_requests_v19(account_id,created_at desc);
create unique index food_quote_request_v19 on public.tool_payment_quotes ((metadata->>'foodRequestId'))
 where tool_id='food-calorie' and metadata->>'foodRequestId' is not null and status in ('quoted','ordered','paid');

create or replace function public.consume_food_analysis_v19(p_id uuid,p_account_id uuid,p_ip_hash text,p_quote_id uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.food_analysis_requests_v19%rowtype; q public.tool_payment_quotes%rowtype;
 d date:=(now() at time zone 'utc')::date;
begin
 select * into r from public.food_analysis_requests_v19 where id=p_id for update;
 if not found or (r.account_id is not null and r.account_id is distinct from p_account_id)
 or (r.account_id is null and r.ip_hash is distinct from p_ip_hash) then raise exception 'REQUEST_NOT_FOUND'; end if;
 if r.consumed_at is not null then
  if p_quote_id is not null and r.quote_id is distinct from p_quote_id then raise exception 'QUOTE_BINDING_MISMATCH'; end if;
  return r.result;
 end if;
 if p_quote_id is not null then
  select * into q from public.tool_payment_quotes where id=p_quote_id for update;
  if not found or p_account_id is null or q.user_id<>p_account_id or q.tool_id<>'food-calorie' or q.status<>'paid' then raise exception 'PAYMENT_REQUIRED'; end if;
  if q.quantity<>r.quantity or q.metadata->>'foodRequestId' is distinct from p_id::text
   or q.amount_rmb<>2*r.quantity or q.amount_usd<>2*r.quantity
   or q.currency not in ('CNY','USD') then raise exception 'QUOTE_BINDING_MISMATCH'; end if;
 else
  if r.expires_at<=now() then raise exception 'REQUEST_EXPIRED'; end if;
  if not r.free_eligible then raise exception 'PAYMENT_REQUIRED'; end if;
  -- A request with an order must finish that order, never race free consumption against payment.
  if exists(select 1 from public.tool_payment_quotes where tool_id='food-calorie' and metadata->>'foodRequestId'=p_id::text and status in ('quoted','ordered','paid')) then raise exception 'PAYMENT_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended('food-free-ip:'||d::text||':'||p_ip_hash,0));
  if p_account_id is not null then perform pg_advisory_xact_lock(hashtextextended('food-free-account:'||d::text||':'||p_account_id::text,0)); end if;
  if exists(select 1 from public.food_calorie_daily_free_usage where usage_day=d and (ip_hash=p_ip_hash or (p_account_id is not null and account_id=p_account_id))) then raise exception 'FREE_ALREADY_USED'; end if;
  insert into public.food_calorie_daily_free_usage(usage_day,account_id,ip_hash) values(d,p_account_id,p_ip_hash);
 end if;
 update public.food_analysis_requests_v19 set consumed_at=now(),quote_id=p_quote_id,account_id=coalesce(account_id,p_account_id) where id=p_id;
 if r.image_session_id is not null then update public.food_calorie_image_sessions_v18 set consumed_at=coalesce(consumed_at,now()),input_digest=r.input_digest where id=r.image_session_id; end if;
 return r.result;
end $$;
revoke all on function public.consume_food_analysis_v19(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.consume_food_analysis_v19(uuid,uuid,text,uuid) to service_role;

-- Serialize quote creation with free consumption so an already-delivered meal cannot be charged.
create function public.bind_food_quote_v19() returns trigger language plpgsql security invoker set search_path='' as $$
declare r public.food_analysis_requests_v19%rowtype;
begin
 if new.tool_id='food-calorie' and new.metadata->>'foodRequestId' is not null then
  select * into r from public.food_analysis_requests_v19 where id=(new.metadata->>'foodRequestId')::uuid for update;
  if not found or r.account_id is distinct from new.user_id or r.consumed_at is not null or r.expires_at<=now()
   or new.quantity<>r.quantity or new.amount_rmb<>2*r.quantity or new.amount_usd<>2*r.quantity then raise exception 'FOOD_QUOTE_INVALID'; end if;
 end if;
 return new;
end $$;
revoke all on function public.bind_food_quote_v19() from public,anon,authenticated;
grant execute on function public.bind_food_quote_v19() to service_role;
create trigger bind_food_quote_v19 before insert on public.tool_payment_quotes for each row execute function public.bind_food_quote_v19();

update public.tool_pricing set base_price_rmb=0,unit_price_rmb=2,min_price_rmb=2,max_price_rmb=null,pricing_json='{}',
 base_price_usd=0,unit_price_usd=2,min_price_usd=2,max_price_usd=null,pricing_json_usd='{}',updated_at=now()
 where tool_id='food-calorie';
