-- V3.4 moderation: authenticated staff, verified owner and immutable audit trail.
-- Never authorize by frontend claims, user_metadata, supplied email, or frontend flags.
create table if not exists private.ai_market_feedback_moderators(
 user_id uuid primary key references auth.users(id) on delete cascade,
 added_at timestamptz not null default now(),
 added_reason text not null default 'operator_verified'
);
revoke all on private.ai_market_feedback_moderators from public, anon, authenticated;
insert into private.ai_market_feedback_moderators(user_id,added_reason)
select id,'verified business@lingxifield.com operator account'
from auth.users
where lower(email)='business@lingxifield.com' and email_confirmed_at is not null
on conflict(user_id) do nothing;

create table if not exists private.ai_market_feedback_moderation_audit(
 id uuid primary key default gen_random_uuid(),
 feedback_id uuid not null references public.ai_market_visitor_feedback(id),
 moderator_id uuid not null references auth.users(id),
 old_status text not null,
 new_status text not null,
 reason text,
 created_at timestamptz not null default now()
);
revoke all on private.ai_market_feedback_moderation_audit from public, anon, authenticated;

create or replace function public.ai_market_pending_feedback(p_limit integer default 30)
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare v_uid uuid; v_results jsonb;
begin
 v_uid:=(select auth.uid());
 if v_uid is null or not exists(
   select 1 from private.ai_market_feedback_moderators where user_id=v_uid
 ) then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into v_results
 from (
  select id,category,product_id,nickname,body,locale,created_at
  from public.ai_market_visitor_feedback
  where status='pending'
  order by created_at asc,id asc limit least(greatest(coalesce(p_limit,30),1),60)
 ) x;
 return jsonb_build_object('items',v_results);
end
$$;
revoke all on function public.ai_market_pending_feedback(integer) from public;
grant execute on function public.ai_market_pending_feedback(integer) to authenticated;

create or replace function public.ai_market_moderate_feedback(
 p_id uuid,p_decision text,p_reason text default ''
)
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare v_uid uuid;v_old text;v_new text;
begin
 v_uid:=(select auth.uid());
 if v_uid is null or not exists(
  select 1 from private.ai_market_feedback_moderators where user_id=v_uid
 ) then raise exception 'NOT_AUTHORIZED' using errcode='42501';end if;
 if p_id is null or p_decision not in ('approved','rejected')
 or char_length(coalesce(p_reason,''))>500 then
  raise exception 'INVALID_MODERATION' using errcode='22023';
 end if;
 update public.ai_market_visitor_feedback
 set status=p_decision,reviewed_at=clock_timestamp(),
     moderator_note=nullif(btrim(p_reason),'')
 where id=p_id and status='pending'
 returning 'pending',status into v_old,v_new;
 if not found then raise exception 'NOT_FOUND_OR_ALREADY_REVIEWED' using errcode='P0002';end if;
 insert into private.ai_market_feedback_moderation_audit
 (feedback_id,moderator_id,old_status,new_status,reason)
 values(p_id,v_uid,v_old,v_new,nullif(btrim(p_reason),''));
 return jsonb_build_object('ok',true,'id',p_id,'status',v_new);
end
$$;
revoke all on function public.ai_market_moderate_feedback(uuid,text,text) from public;
grant execute on function public.ai_market_moderate_feedback(uuid,text,text) to authenticated;
