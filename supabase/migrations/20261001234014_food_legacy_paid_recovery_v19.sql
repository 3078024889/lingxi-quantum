-- Honor unused historical purchases at their original price, once only.
create function public.consume_legacy_food_analysis_v19(p_id uuid,p_account_id uuid,p_ip_hash text,p_quote_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.food_analysis_requests_v19%rowtype; q public.tool_payment_quotes%rowtype; g public.tool_export_grants%rowtype; allowed integer; expected_mode text;
begin
 select * into r from public.food_analysis_requests_v19 where id=p_id for update;
 if not found or p_account_id is null or (r.account_id is not null and r.account_id<>p_account_id) or (r.account_id is null and r.ip_hash is distinct from p_ip_hash) then raise exception 'REQUEST_NOT_FOUND';end if;
 if r.consumed_at is not null then
  if r.quote_id is distinct from p_quote_id then raise exception 'QUOTE_BINDING_MISMATCH';end if;
  return r.result;
 end if;
 select * into q from public.tool_payment_quotes where id=p_quote_id for update;
 if not found or q.user_id<>p_account_id or q.tool_id<>'food-calorie' or q.status<>'paid' or q.created_at>='2026-10-01 23:40:14+00'::timestamptz or q.metadata->>'foodRequestId' is not null then raise exception 'PAYMENT_REQUIRED';end if;
 select * into g from public.tool_export_grants where quote_id=p_quote_id and user_id=p_account_id for update;
 if not found or coalesce(g.consumed_quantity,0)<>0
  or exists(select 1 from public.food_calorie_paid_consumptions_v16 where quote_id=p_quote_id)
  or exists(select 1 from public.food_calorie_paid_consumptions_v18 where quote_id=p_quote_id)
  or exists(select 1 from public.food_analysis_requests_v19 where quote_id=p_quote_id) then raise exception 'QUOTE_BINDING_MISMATCH';end if;
 expected_mode:=case when q.metadata->>'mode' in ('name-weight','custom','manual') then 'custom' else 'image' end;
 allowed:=case when expected_mode='custom' and q.metadata->>'foods'~'^[0-9]{1,2}$' then (q.metadata->>'foods')::integer
  when expected_mode='image' and q.metadata->>'images'~'^[0-9]{1,2}$' then (q.metadata->>'images')::integer else floor(q.quantity)::integer end;
 if r.mode<>expected_mode or r.quantity>allowed then raise exception 'QUOTE_BINDING_MISMATCH';end if;
 if exists(select 1 from public.tool_payment_quotes where tool_id='food-calorie' and metadata->>'foodRequestId'=p_id::text and status in ('quoted','ordered','paid')) then raise exception 'PAYMENT_REQUIRED';end if;
 update public.tool_export_grants set consumed_quantity=quantity where quote_id=p_quote_id;
 update public.tool_payment_quotes set metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('legacyFoodAnalysisId',p_id) where id=p_quote_id;
 update public.food_analysis_requests_v19 set account_id=p_account_id,quote_id=p_quote_id,consumed_at=now() where id=p_id;
 if r.image_session_id is not null then update public.food_calorie_image_sessions_v18 set consumed_at=coalesce(consumed_at,now()),input_digest=r.input_digest where id=r.image_session_id;end if;
 return r.result;
end $$;
revoke all on function public.consume_legacy_food_analysis_v19(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.consume_legacy_food_analysis_v19(uuid,uuid,text,uuid) to service_role;
