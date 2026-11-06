-- Disposable PG17: refuted order revival and costly stage replay.
begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 b uuid:='22222222-2222-4222-8222-222222222222';
 first_purchase uuid:='c1111111-1111-4111-8111-111111111111';
 second_purchase uuid:='c2222222-2222-4222-8222-222222222222';
 r1 uuid:='c3333333-3333-4333-8333-333333333333';
 r2 uuid:='c4444444-4444-4444-8444-444444444444';
 op uuid:='c5555555-5555-4555-8555-555555555555';
 wrong_op uuid:='c6666666-6666-4666-8666-666666666666';
 food_r uuid:='c7777777-7777-4777-8777-777777777777';
 food_op uuid:='c8888888-8888-4888-8888-888888888888';
 pass1 uuid;
 pass2 uuid;
 value jsonb;
begin
 insert into public.lingxi_tool_passes(user_id,sku,currency,price_minor,
   purchase_request_id,starts_at,expires_at)
 values(a,'tool_pass_7d','CNY',2900,first_purchase,now()-interval '2 minutes',now()+interval '7 days')
 returning id into pass1;
 value:=public.lingxi_claim_tool_use(r1,a,repeat('a',64),'document-translate',1);
 if value->>'ok' is distinct from 'true' or value->>'accessKind' is distinct from 'pass'
  then raise exception 'FIRST_PASS_CLAIM_FAILED %',value;end if;
 if (select pass_id from public.lingxi_tool_use_events where request_id=r1) is distinct from pass1
  then raise exception 'CLAIM_NOT_BOUND_TO_SOURCE_PASS';end if;
 insert into public.lingxi_tool_passes(user_id,sku,currency,price_minor,
   purchase_request_id,starts_at,expires_at)
 values(a,'tool_pass_30d','USD',9900,second_purchase,now()-interval '1 minute',now()+interval '30 days')
 returning id into pass2;
 update public.lingxi_tool_passes set revoked_at=now() where id=pass1;
 value:=public.lingxi_redeem_tool_stage(r1,a,'document-translate',op,'document-translate');
 if value->>'error' is distinct from 'PASS_REVOKED'
  then raise exception 'REFUNDED_PASS_RESTORED_VIA_NEW_PASS %',value;end if;
 value:=public.lingxi_claim_tool_use(r2,a,repeat('b',64),'document-translate',1);
 if value->>'ok' is distinct from 'true' then raise exception 'NEW_PASS_CLAIM_FAILED %',value;end if;
 if (select pass_id from public.lingxi_tool_use_events where request_id=r2) is distinct from pass2
  then raise exception 'NEW_PASS_NOT_BOUND_TO_OWN_ORDER';end if;
 value:=public.lingxi_redeem_tool_stage(r2,a,'document-translate',op,'document-translate');
 if value->>'ok' is distinct from 'true' or value->>'alreadyStarted' is distinct from 'false'
  then raise exception 'STAGE_START_FAILED %',value;end if;
 value:=public.lingxi_redeem_tool_stage(r2,a,'document-translate',op,'document-translate');
 if value->>'alreadyStarted' is distinct from 'true' then raise exception 'STAGE_REPLAY_NOT_RECORDED %',value;end if;
 value:=public.lingxi_redeem_tool_stage(r2,a,'document-translate',wrong_op,'document-translate');
 if value->>'error' is distinct from 'TOOL_USE_RECEIPT_ALREADY_USED' then raise exception 'STAGE_OTHER_TASK_BYPASS %',value;end if;
 value:=public.lingxi_redeem_tool_stage(r2,b,'document-translate',op,'document-translate');
 if value->>'error' is distinct from 'TOOL_USE_RECEIPT_INVALID' then raise exception 'STAGE_OTHER_ACCOUNT_BYPASS %',value;end if;
 value:=public.lingxi_redeem_tool_stage(r2,a,'document-translate',op,'media-tts');
 if value->>'ok' is distinct from 'true' then raise exception 'SECOND_DISTINCT_STAGE_BROKEN %',value;end if;
 value:=public.lingxi_redeem_tool_stage(r2,a,'document-translate',op,'arbitrary');
 if value->>'error' is distinct from 'INVALID_EXECUTION_STAGE' then raise exception 'ARBITRARY_STAGE_ALLOWED %',value;end if;
 if (select count(*) from public.lingxi_tool_execution_stages where request_id=r2)<>2
  then raise exception 'DUPLICATE_PROCESSING_STAGE_CREATED';end if;
 -- Image upload can redeem an operation before analysis. Analysis is
 -- separately one-time and must not run a second remote model request.
 value:=public.lingxi_claim_tool_use(food_r,a,repeat('c',64),'food-calorie',1);
 if value->>'ok' is distinct from 'true' then raise exception 'FOOD_CLAIM_FAILED';end if;
 value:=public.lingxi_redeem_tool_use(food_r,a,'food-calorie',food_op);
 if value->>'ok' is distinct from 'true' then raise exception 'FOOD_SESSION_START_FAILED';end if;
 value:=public.lingxi_redeem_tool_stage(food_r,a,'food-calorie',food_op,'food-analysis');
 if value->>'alreadyStarted' is distinct from 'false' then raise exception 'FOOD_FIRST_ANALYSIS_FAILED %',value;end if;
 value:=public.lingxi_redeem_tool_stage(food_r,a,'food-calorie',food_op,'food-analysis');
 if value->>'alreadyStarted' is distinct from 'true' then raise exception 'FOOD_DOUBLE_ANALYSIS_ALLOWED %',value;end if;
end $$;
do $$
begin
 if has_function_privilege('authenticated',
    'public.lingxi_redeem_tool_stage(uuid,uuid,text,uuid,text)','EXECUTE') or
    has_function_privilege('anon',
    'public.lingxi_redeem_tool_stage(uuid,uuid,text,uuid,text)','EXECUTE')
 then raise exception 'PUBLIC_STAGE_RPC_VISIBLE';end if;
end $$;
rollback;
