begin;
create or replace function public.lingxi_consume_food_pass_v1(
 p_id uuid,p_user_id uuid,p_access_request_id uuid
)returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.food_analysis_requests_v19%rowtype;v jsonb;
begin
 if p_id is null or p_user_id is null or p_access_request_id is null
 then raise exception 'TOOL_USE_RECEIPT_INVALID';end if;
 select * into r from public.food_analysis_requests_v19 where id=p_id for update;
 if not found or r.account_id is distinct from p_user_id
 then raise exception 'REQUEST_NOT_FOUND';end if;
 if r.consumed_at is not null then return r.result;end if;
 if r.expires_at<=now() then raise exception 'REQUEST_EXPIRED';end if;
 if exists(select 1 from public.tool_payment_quotes where tool_id='food-calorie'
    and metadata->>'foodRequestId'=p_id::text and status in ('quoted','ordered','paid'))
 then raise exception 'LEGACY_QUOTE_PRESENT';end if;
 v:=public.lingxi_redeem_tool_use(p_access_request_id,p_user_id,'food-calorie',p_id);
 if v->>'ok'<>'true' then raise exception 'TOOL_USE_RECEIPT_INVALID';end if;
 update public.food_analysis_requests_v19 set consumed_at=now() where id=p_id;
 if r.image_session_id is not null then
  update public.food_calorie_image_sessions_v18
  set consumed_at=coalesce(consumed_at,now()),input_digest=r.input_digest
  where id=r.image_session_id;
 end if;
 return r.result;
end $$;
revoke all on function public.lingxi_consume_food_pass_v1(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.lingxi_consume_food_pass_v1(uuid,uuid,uuid) to service_role;
commit;
