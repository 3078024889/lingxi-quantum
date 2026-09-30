-- LINGXIFIELD Food Production Closeout V18
-- Built against verified production schema: nutrition_food_compact primary key = id.
-- Production already has the correct independent uniqueness controls:
-- food_calorie_free_account_day_v16: UNIQUE (usage_day, account_id) WHERE account_id IS NOT NULL
-- food_calorie_free_ip_day: UNIQUE (usage_day, ip_hash)
-- Preserve them. Do not drop/recreate constraint-backed indexes here.
create table if not exists public.food_calorie_image_sessions_v18(
 id uuid primary key default gen_random_uuid(),account_id uuid null references auth.users(id) on delete cascade,
 ip_hash text not null check(length(ip_hash)=64),image_hashes jsonb not null check(jsonb_typeof(image_hashes)='array'),
 photo_count integer not null check(photo_count between 1 and 20),input_digest text null check(input_digest is null or length(input_digest)=64),
 consumed_at timestamptz null,created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '30 minutes',
 check(jsonb_array_length(image_hashes)=photo_count));
alter table public.food_calorie_image_sessions_v18 enable row level security;
revoke all on public.food_calorie_image_sessions_v18 from public,anon,authenticated;
grant all on public.food_calorie_image_sessions_v18 to service_role;

create table if not exists public.food_calorie_paid_consumptions_v18(
 quote_id uuid primary key references public.tool_payment_quotes(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,
 image_session_id uuid not null references public.food_calorie_image_sessions_v18(id),input_digest text not null check(length(input_digest)=64),
 photo_count integer not null check(photo_count between 1 and 20),result jsonb not null,created_at timestamptz not null default now());
alter table public.food_calorie_paid_consumptions_v18 enable row level security;
revoke all on public.food_calorie_paid_consumptions_v18 from public,anon,authenticated;
grant all on public.food_calorie_paid_consumptions_v18 to service_role;

create table if not exists public.nutrition_food_i18n_v18(
 food_id bigint primary key references public.nutrition_food_compact(id) on delete cascade,
 name_en text not null,name_zh text,name_ja text,name_ko text,name_fr text,name_de text,name_es text,name_pt text,name_ar text,
 aliases jsonb not null default '{}'::jsonb,verified boolean not null default false,updated_at timestamptz not null default now());
alter table public.nutrition_food_i18n_v18 enable row level security;
revoke all on public.nutrition_food_i18n_v18 from public,anon,authenticated;
grant all on public.nutrition_food_i18n_v18 to service_role;

create or replace function public.calculate_food_daily_free_bound_v18(p_session_id uuid,p_account_id uuid,p_ip_hash text,p_input_digest text,p_items jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.food_calorie_image_sessions_v18%rowtype;v_day date:=(now() at time zone 'utc')::date;v_result jsonb;
begin
 if length(coalesce(p_ip_hash,''))<>64 or length(coalesce(p_input_digest,''))<>64 then raise exception 'INVALID_BINDING';end if;
 select * into s from public.food_calorie_image_sessions_v18 where id=p_session_id for update;
 if not found or s.expires_at<=now() or s.consumed_at is not null or s.photo_count<>1 or s.ip_hash<>p_ip_hash or s.account_id is distinct from p_account_id then raise exception 'IMAGE_SESSION_INVALID';end if;
 perform pg_advisory_xact_lock(hashtextextended('food-free-ip:'||v_day::text||':'||p_ip_hash,0));
 if p_account_id is not null then perform pg_advisory_xact_lock(hashtextextended('food-free-account:'||v_day::text||':'||p_account_id::text,0));end if;
 if exists(select 1 from public.food_calorie_daily_free_usage where usage_day=v_day and ip_hash=p_ip_hash) then raise exception 'FREE_ALREADY_USED';end if;
 if p_account_id is not null and exists(select 1 from public.food_calorie_daily_free_usage where usage_day=v_day and account_id=p_account_id) then raise exception 'FREE_ALREADY_USED';end if;
 select public.calculate_food_compact_v1(p_items) into v_result;if v_result is null then raise exception 'CALCULATION_UNAVAILABLE';end if;
 insert into public.food_calorie_daily_free_usage(usage_day,account_id,ip_hash) values(v_day,p_account_id,p_ip_hash);
 update public.food_calorie_image_sessions_v18 set input_digest=p_input_digest,consumed_at=now() where id=p_session_id;
 return v_result;
end $$;
revoke all on function public.calculate_food_daily_free_bound_v18(uuid,uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.calculate_food_daily_free_bound_v18(uuid,uuid,text,text,jsonb) to service_role;

create or replace function public.calculate_food_paid_bound_v18(p_quote_id uuid,p_session_id uuid,p_user_id uuid,p_ip_hash text,p_photo_count integer,p_input_digest text,p_items jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q public.tool_payment_quotes%rowtype;s public.food_calorie_image_sessions_v18%rowtype;old public.food_calorie_paid_consumptions_v18%rowtype;v_result jsonb;
begin
 select * into q from public.tool_payment_quotes where id=p_quote_id for update;
 if not found or q.user_id<>p_user_id or q.tool_id<>'food-calorie' or q.status<>'paid' then raise exception 'PAYMENT_REQUIRED';end if;
 if q.quantity<>p_photo_count then raise exception 'QUOTE_QUANTITY_MISMATCH';end if;
 select * into old from public.food_calorie_paid_consumptions_v18 where quote_id=p_quote_id;
 if found then if old.user_id=p_user_id and old.image_session_id=p_session_id and old.input_digest=p_input_digest and old.photo_count=p_photo_count then return old.result;end if;raise exception 'QUOTE_ALREADY_CONSUMED';end if;
 select * into s from public.food_calorie_image_sessions_v18 where id=p_session_id for update;
 if not found or s.expires_at<=now() or s.consumed_at is not null or s.account_id is distinct from p_user_id or s.ip_hash<>p_ip_hash or s.photo_count<>p_photo_count then raise exception 'IMAGE_SESSION_INVALID';end if;
 select public.calculate_food_compact_v1(p_items) into v_result;if v_result is null then raise exception 'CALCULATION_UNAVAILABLE';end if;
 insert into public.food_calorie_paid_consumptions_v18(quote_id,user_id,image_session_id,input_digest,photo_count,result) values(p_quote_id,p_user_id,p_session_id,p_input_digest,p_photo_count,v_result);
 update public.food_calorie_image_sessions_v18 set input_digest=p_input_digest,consumed_at=now() where id=p_session_id;
 return v_result;
end $$;
revoke all on function public.calculate_food_paid_bound_v18(uuid,uuid,uuid,text,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.calculate_food_paid_bound_v18(uuid,uuid,uuid,text,integer,text,jsonb) to service_role;
