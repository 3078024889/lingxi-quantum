-- Assert security and financial contracts in an isolated transaction.
begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 b uuid:='22222222-2222-4222-8222-222222222222';
 e uuid:='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 p uuid:='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 x uuid:='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 v jsonb;
 v_exp timestamptz;
begin
 v:=public.lingxi_claim_tool_use(e,a,repeat('a',64),'pdf-editor',1);
 if v->>'accessKind'<>'daily_free' or v->>'ok'<>'true' then raise exception 'FIRST_USE_FAILED %',v;end if;
 v:=public.lingxi_claim_tool_use(e,a,repeat('a',64),'pdf-editor',1);
 if v->>'alreadyClaimed'<>'true' then raise exception 'IDEMPOTENT_RETRY_FAILED %',v;end if;
 v:=public.lingxi_claim_tool_use(e,b,repeat('a',64),'pdf-editor',1);
 if v->>'error'<>'IDEMPOTENCY_CONFLICT' then raise exception 'CLAIM_REBIND_ALLOWED %',v;end if;
 v:=public.lingxi_claim_tool_use('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab',a,repeat('b',64),'pdf-editor',1);
 if v->>'error'<>'DAILY_TOOL_FREE_USED' then raise exception 'ACCOUNT_DUAL_IP_BYPASS %',v;end if;
 v:=public.lingxi_claim_tool_use('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac',b,repeat('a',64),'pdf-editor',1);
 if v->>'error'<>'DAILY_TOOL_FREE_USED' then raise exception 'IP_MULTI_ACCOUNT_BYPASS %',v;end if;
 v:=public.lingxi_claim_tool_use('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaad',b,repeat('b',64),'pdf-editor',2);
 if v->>'error'<>'TOOL_PASS_REQUIRED' then raise exception 'BATCH_FREE_BYPASS %',v;end if;
 v:=public.lingxi_claim_tool_use('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaae',b,repeat('b',64),'ocr',1);
 if v->>'accessKind'<>'daily_free' then raise exception 'TOOL_ISOLATION_FAILED %',v;end if;

 v:=public.lingxi_purchase_tool_pass(a,p,'tool_pass_7d','CNY');
 if v->>'ok'<>'true' or (v->>'chargedMinor')::int<>2900 then raise exception 'CNY_PASS_FAILED %',v;end if;
 v_exp:=(v->>'expiresAt')::timestamptz;
 v:=public.lingxi_purchase_tool_pass(a,p,'tool_pass_7d','CNY');
 if v->>'alreadyPurchased'<>'true' then raise exception 'DOUBLE_SPEND_IDEMPOTENCY %',v;end if;
 v:=public.lingxi_purchase_tool_pass(a,p,'tool_pass_7d','USD');
 if v->>'error'<>'IDEMPOTENCY_CONFLICT' then raise exception 'CURRENCY_REBIND %',v;end if;
 v:=public.lingxi_purchase_tool_pass(a,x,'tool_pass_90d','USD');
 if v->>'ok'<>'true' or (v->>'chargedMinor')::int<>26900 then raise exception 'USD_PASS_FAILED %',v;end if;
 if (v->>'startsAt')::timestamptz<v_exp then raise exception 'PASS_OVERLAP_NOT_EXTENDED';end if;
 if (select count(*) from public.test_charges where user_id=a)<>2 then raise exception 'CHARGED_MORE_THAN_TWICE';end if;
 if (select cny_minor from public.test_wallets where user_id=a)<>197100 then raise exception 'WRONG_CNY_LEDGER';end if;
 if (select usd_minor from public.test_wallets where user_id=a)<>173100 then raise exception 'WRONG_USD_LEDGER';end if;
 v:=public.lingxi_claim_tool_use('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaf',a,repeat('b',64),'pdf-editor',25);
 if v->>'accessKind'<>'pass' then raise exception 'PAID_PASS_NOT_GRANTED %',v;end if;
 if (select count(*) from public.orders where user_id=a and product_type='tool_pass')<>2 then raise exception 'ORDERS_NOT_RECORDED';end if;
 if not exists(select 1 from public.orders where user_id=a and product_type='tool_pass'
   and currency='CNY' and amount_rmb=29 and amount_usd=0)
 then raise exception 'CNY_REVENUE_DUPLICATED';end if;
 if not exists(select 1 from public.orders where user_id=a and product_type='tool_pass'
   and currency='USD' and amount_rmb is null and amount_usd=269)
 then raise exception 'USD_REVENUE_DUPLICATED';end if;
 if (select count(*) from public.orders where user_id=a and product_type='tool_pass'
      and ((currency='CNY' and (amount_rmb is null or amount_usd<>0))
        or (currency='USD' and (amount_rmb is not null or amount_usd<=0))))<>0
 then raise exception 'CROSS_CURRENCY_ORDER_VALUE';end if;
 -- Funds are already settled; a later refund must explicitly revoke entitlement.
 update public.lingxi_tool_passes set revoked_at=now(),revocation_reason='test_refund'
 where purchase_request_id=p;
 if (select count(*) from public.lingxi_tool_passes where purchase_request_id=p and revoked_at is not null)<>1 then raise exception 'REFUND_REVOCATION_MISSING';end if;
end $$;
-- Public Data API roles must have no direct access to entitlement tables or functions.
do $$
begin
 if has_table_privilege('anon','public.lingxi_tool_passes','SELECT') or has_table_privilege('authenticated','public.lingxi_tool_use_events','INSERT')
 then raise exception 'PUBLIC_TABLE_PRIVILEGE_LEAK';end if;
 if has_function_privilege('anon','public.lingxi_purchase_tool_pass(uuid,uuid,text,text)','EXECUTE')
 or has_function_privilege('authenticated','public.lingxi_claim_tool_use(uuid,uuid,text,text,integer)','EXECUTE')
 then raise exception 'PUBLIC_RPC_PRIVILEGE_LEAK';end if;
end $$;
rollback;
