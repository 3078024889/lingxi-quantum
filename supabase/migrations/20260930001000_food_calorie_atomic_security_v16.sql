-- LINGXIFIELD Food Nutrition Security & Experience V16
-- Apply only after local build/gates pass. This migration is idempotent.

alter table public.food_calorie_daily_free_usage
  drop constraint if exists food_calorie_free_account_day;
drop index if exists public.food_calorie_free_account_day;
create unique index if not exists food_calorie_free_account_day_v16
  on public.food_calorie_daily_free_usage(usage_day,account_id)
  where account_id is not null;
create unique index if not exists food_calorie_free_ip_day_v16
  on public.food_calorie_daily_free_usage(usage_day,ip_hash);

create table if not exists public.food_calorie_paid_consumptions_v16(
 quote_id uuid primary key references public.tool_payment_quotes(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 input_digest text not null check(length(input_digest)=64),
 photo_count integer not null check(photo_count between 1 and 50),
 result jsonb not null,
 created_at timestamptz not null default now()
);
alter table public.food_calorie_paid_consumptions_v16 enable row level security;
revoke all on public.food_calorie_paid_consumptions_v16 from public,anon,authenticated;
grant all on public.food_calorie_paid_consumptions_v16 to service_role;

create or replace function public.calculate_food_daily_free_v16(
 p_account_id uuid,p_ip_hash text,p_items jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_day date:=(now() at time zone 'utc')::date; v_result jsonb; v_count int;
begin
 if p_ip_hash is null or length(p_ip_hash)<>64 then raise exception 'INVALID_IP_HASH'; end if;
 if jsonb_typeof(p_items)<>'array' then raise exception 'INVALID_ITEMS'; end if;
 v_count:=jsonb_array_length(p_items); if v_count<1 or v_count>30 then raise exception 'INVALID_ITEMS'; end if;
 perform pg_advisory_xact_lock(hashtextextended('food-free-ip:'||v_day::text||':'||p_ip_hash,0));
 if p_account_id is not null then perform pg_advisory_xact_lock(hashtextextended('food-free-account:'||v_day::text||':'||p_account_id::text,0)); end if;
 if exists(select 1 from public.food_calorie_daily_free_usage where usage_day=v_day and ip_hash=p_ip_hash) then raise exception 'FREE_ALREADY_USED'; end if;
 if p_account_id is not null and exists(select 1 from public.food_calorie_daily_free_usage where usage_day=v_day and account_id=p_account_id) then raise exception 'FREE_ALREADY_USED'; end if;
 select public.calculate_food_compact_v1(p_items) into v_result;
 if v_result is null then raise exception 'CALCULATION_UNAVAILABLE'; end if;
 insert into public.food_calorie_daily_free_usage(usage_day,account_id,ip_hash) values(v_day,p_account_id,p_ip_hash);
 return v_result;
end $$;
revoke all on function public.calculate_food_daily_free_v16(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.calculate_food_daily_free_v16(uuid,text,jsonb) to service_role;

create or replace function public.calculate_food_paid_v16(
 p_quote_id uuid,p_user_id uuid,p_photo_count integer,p_input_digest text,p_items jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_quote public.tool_payment_quotes%rowtype; v_old public.food_calorie_paid_consumptions_v16%rowtype; v_result jsonb;
begin
 if p_photo_count<1 or p_photo_count>50 or p_input_digest is null or length(p_input_digest)<>64 then raise exception 'INVALID_REQUEST'; end if;
 select * into v_quote from public.tool_payment_quotes where id=p_quote_id for update;
 if not found or v_quote.user_id<>p_user_id or v_quote.tool_id<>'food-calorie' then raise exception 'QUOTE_NOT_FOUND'; end if;
 if v_quote.status<>'paid' then raise exception 'PAYMENT_REQUIRED'; end if;
 if v_quote.quantity<>p_photo_count then raise exception 'QUOTE_QUANTITY_MISMATCH'; end if;
 select * into v_old from public.food_calorie_paid_consumptions_v16 where quote_id=p_quote_id;
 if found then
   if v_old.user_id=p_user_id and v_old.input_digest=p_input_digest and v_old.photo_count=p_photo_count then return v_old.result; end if;
   raise exception 'QUOTE_ALREADY_CONSUMED';
 end if;
 select public.calculate_food_compact_v1(p_items) into v_result;
 if v_result is null then raise exception 'CALCULATION_UNAVAILABLE'; end if;
 insert into public.food_calorie_paid_consumptions_v16(quote_id,user_id,input_digest,photo_count,result)
 values(p_quote_id,p_user_id,p_input_digest,p_photo_count,v_result);
 return v_result;
end $$;
revoke all on function public.calculate_food_paid_v16(uuid,uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.calculate_food_paid_v16(uuid,uuid,integer,text,jsonb) to service_role;
