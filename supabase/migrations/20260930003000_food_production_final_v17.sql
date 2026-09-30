-- LINGXIFIELD FOOD PRODUCTION FINAL
create table if not exists public.food_calorie_image_sessions_v17(
 id uuid primary key default gen_random_uuid(),
 account_id uuid null references auth.users(id) on delete cascade,
 ip_hash text not null check(length(ip_hash)=64),
 image_hashes jsonb not null check(jsonb_typeof(image_hashes)='array'),
 photo_count integer not null check(photo_count between 1 and 20),
 input_digest text null check(input_digest is null or length(input_digest)=64),
 claimed_at timestamptz null,
 consumed_at timestamptz null,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '30 minutes',
 check(jsonb_array_length(image_hashes)=photo_count)
);
alter table public.food_calorie_image_sessions_v17 enable row level security;
revoke all on public.food_calorie_image_sessions_v17 from public,anon,authenticated;
grant all on public.food_calorie_image_sessions_v17 to service_role;
create index if not exists food_image_sessions_account_expiry_v17 on public.food_calorie_image_sessions_v17(account_id,expires_at);
create index if not exists food_image_sessions_ip_expiry_v17 on public.food_calorie_image_sessions_v17(ip_hash,expires_at);

create table if not exists public.nutrition_food_i18n_v17(
 food_id bigint primary key references public.nutrition_food_compact(food_id) on delete cascade,
 name_en text not null,name_zh text not null,name_ja text not null,name_ko text not null,
 name_fr text not null,name_de text not null,name_es text not null,name_pt text not null,name_ar text not null,
 aliases jsonb not null default '{}'::jsonb,
 verified boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.nutrition_food_i18n_v17 enable row level security;
revoke all on public.nutrition_food_i18n_v17 from public,anon,authenticated;
grant select,insert,update,delete on public.nutrition_food_i18n_v17 to service_role;

alter table public.food_calorie_paid_consumptions_v16
 add column if not exists image_session_id uuid null references public.food_calorie_image_sessions_v17(id);

create or replace function public.claim_food_image_session_v17(
 p_session_id uuid,p_account_id uuid,p_ip_hash text,p_photo_count integer,p_input_digest text
) returns boolean language plpgsql security definer set search_path=public as $$
declare s public.food_calorie_image_sessions_v17%rowtype;
begin
 select * into s from public.food_calorie_image_sessions_v17 where id=p_session_id for update;
 if not found or s.expires_at<=now() or s.consumed_at is not null or s.claimed_at is not null then raise exception 'IMAGE_SESSION_INVALID'; end if;
 if s.photo_count<>p_photo_count then raise exception 'IMAGE_COUNT_MISMATCH'; end if;
 if s.account_id is distinct from p_account_id then
   if not(s.account_id is null and p_account_id is null) then raise exception 'IMAGE_SESSION_OWNER_MISMATCH'; end if;
 end if;
 if s.ip_hash<>p_ip_hash then raise exception 'IMAGE_SESSION_IP_MISMATCH'; end if;
 update public.food_calorie_image_sessions_v17 set input_digest=p_input_digest,claimed_at=now() where id=p_session_id;
 return true;
end $$;
revoke all on function public.claim_food_image_session_v17(uuid,uuid,text,integer,text) from public,anon,authenticated;
grant execute on function public.claim_food_image_session_v17(uuid,uuid,text,integer,text) to service_role;

create or replace function public.release_food_image_session_v17(p_session_id uuid,p_input_digest text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update public.food_calorie_image_sessions_v17 set claimed_at=null,input_digest=null
 where id=p_session_id and consumed_at is null and input_digest=p_input_digest;
 return found;
end $$;
revoke all on function public.release_food_image_session_v17(uuid,text) from public,anon,authenticated;
grant execute on function public.release_food_image_session_v17(uuid,text) to service_role;

create or replace function public.consume_food_image_session_v17(p_session_id uuid,p_input_digest text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update public.food_calorie_image_sessions_v17 set consumed_at=now()
 where id=p_session_id and consumed_at is null and claimed_at is not null and input_digest=p_input_digest;
 if not found then raise exception 'IMAGE_SESSION_BINDING_MISMATCH'; end if;
 return true;
end $$;
revoke all on function public.consume_food_image_session_v17(uuid,text) from public,anon,authenticated;
grant execute on function public.consume_food_image_session_v17(uuid,text) to service_role;
