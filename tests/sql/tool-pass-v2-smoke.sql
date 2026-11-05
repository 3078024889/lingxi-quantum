-- Run ONLY in an ephemeral PostgreSQL test database after the schema draft.
do $$
declare
 user_a uuid:='a0000000-0000-4000-8000-000000000001';
 user_b uuid:='b0000000-0000-4000-8000-000000000002';
 user_c uuid:='c0000000-0000-4000-8000-000000000003';
 request_a uuid:='a1111111-1111-4111-8111-111111111111';
 request_b uuid:='a2222222-2222-4222-8222-222222222222';
 free1 uuid:='e1111111-1111-4111-8111-111111111111';
 free2 uuid:='e2222222-2222-4222-8222-222222222222';
 free3 uuid:='e3333333-3333-4333-8333-333333333333';
 free4 uuid:='e4444444-4444-4444-8444-444444444444';
 ipa text:=repeat('a',64);
 ipb text:=repeat('b',64);
 x jsonb;y jsonb;start_first timestamptz;end_first timestamptz;
begin
 x:=public.purchase_tool_pass_v2(user_a,request_a,'tools_7d','CNY');
 if (x->>'ok') IS DISTINCT FROM 'true' or (x->>'chargedMinor')::bigint<>2900 then raise exception 'FIRST_PURCHASE_FAILED %',x;end if;
 start_first:=(x->>'startsAt')::timestamptz;end_first:=(x->>'endsAt')::timestamptz;
 y:=public.purchase_tool_pass_v2(user_a,request_a,'tools_7d','CNY');
 if (y->>'alreadyPurchased') IS DISTINCT FROM 'true' then raise exception 'REPLAY_NOT_IDEMPOTENT %',y;end if;
 if (select count(*) from public.test_toolpass_charges)<>1 then raise exception 'DOUBLE_CHARGE';end if;
 y:=public.purchase_tool_pass_v2(user_a,request_b,'tools_30d','USD');
 if (y->>'ok') IS DISTINCT FROM 'true' or (y->>'chargedMinor')::bigint<>9900 then raise exception 'USD_AMOUNT_BAD %',y;end if;
 if (y->>'startsAt')::timestamptz<end_first then raise exception 'OVERLAPPING_PURCHASE_NOT_EXTENDED';end if;
 if (select count(*) from public.test_toolpass_charges)<>2 then raise exception 'EXPECTED_TWO_CHARGES';end if;
 y:=public.purchase_tool_pass_v2(user_b,request_a,'tools_7d','USD');
 if (y->>'error') IS DISTINCT FROM 'IDEMPOTENCY_CONFLICT' then raise exception 'CROSS_USER_REPLAY_UNBLOCKED %',y;end if;
 y:=public.purchase_tool_pass_v2(user_b,'a3333333-3333-4333-8333-333333333333','tools_unknown','CNY');
 if (y->>'error') IS DISTINCT FROM 'INVALID_PLAN' then raise exception 'UNKNOWN_SKU_ACCEPTED %',y;end if;
 -- Paid operation is distinct from lifetime free use.
 y:=public.claim_tool_pass_use_v2(user_a,'d1111111-1111-4111-8111-111111111111','ocr',ipa);
 if (y->>'access') IS DISTINCT FROM 'pass' then raise exception 'PASS_ACCESS_FAIL %',y;end if;
 y:=public.claim_tool_pass_use_v2(user_b,free1,'ocr',ipa);
 if (y->>'access') IS DISTINCT FROM 'free' then raise exception 'FIRST_FREE_FAIL %',y;end if;
 y:=public.claim_tool_pass_use_v2(user_b,free1,'ocr',ipa);
 if (y->>'alreadyClaimed') IS DISTINCT FROM 'true' then raise exception 'FREE_REPLAY_NOT_IDEMPOTENT %',y;end if;
 y:=public.claim_tool_pass_use_v2(user_c,free2,'ocr',ipa);
 if (y->>'error') IS DISTINCT FROM 'FREE_USED_PASS_REQUIRED' then raise exception 'IP_REUSE_UNBLOCKED %',y;end if;
 y:=public.claim_tool_pass_use_v2(user_b,free3,'ocr',ipb);
 if (y->>'error') IS DISTINCT FROM 'FREE_USED_PASS_REQUIRED' then raise exception 'ACCOUNT_REUSE_UNBLOCKED %',y;end if;
 y:=public.claim_tool_pass_use_v2(user_c,free4,'ocr',ipb);
 if (y->>'access') IS DISTINCT FROM 'free' then raise exception 'SEPARATE_IP_FREE_BLOCKED %',y;end if;
 y:=public.claim_tool_pass_use_v2(user_c,'e5555555-5555-4555-8555-555555555555','sasi-video-generate',ipb);
 if (y->>'error') IS DISTINCT FROM 'TOOL_NOT_COVERED' then raise exception 'SASI_ACCESS_BYPASS %',y;end if;
 -- Test revocation behaviour only: this is NOT an actual money refund.
 update public.tool_pass_orders_v2 set state='refunded' where user_id=user_a;
 y:=public.purchase_tool_pass_v2(user_a,request_a,'tools_7d','CNY');
 if (y->>'error') IS DISTINCT FROM 'PASS_NOT_ACTIVE' then
  raise exception 'REFUNDED_PURCHASE_REPLAY_ACCEPTED %',y;end if;
 y:=public.claim_tool_pass_use_v2(user_a,'d1111111-1111-4111-8111-111111111111','ocr',ipa);
 if (y->>'error') IS DISTINCT FROM 'PASS_EXPIRED_OR_REVOKED' then
  raise exception 'REVOKED_PASS_REPLAY_ACCEPTED %',y;end if;
 update public.tool_pass_operation_v2 set claimed_at=now()-interval '11 minutes'
  where operation_id=free1;
 y:=public.claim_tool_pass_use_v2(user_b,free1,'ocr',ipa);
 if (y->>'error') IS DISTINCT FROM 'OPERATION_RECEIPT_EXPIRED' then
  raise exception 'OLD_FREE_RECEIPT_REPLAY_ACCEPTED %',y;end if;
 if (select count(*) from public.test_toolpass_charges)<>2 then
  raise exception 'TEST_MUST_NOT_MUTATE_MONEY_RECORDS';end if;
 raise notice 'TOOL_PASS_V2_POSTGRES_EPHEMERAL_ACCEPTANCE_OK';
end $$;
