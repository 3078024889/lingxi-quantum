-- Run only in disposable PostgreSQL 17 after purchase and refund SQL drafts.
do $$
declare
 d uuid:='d0000000-0000-4000-8000-000000000004';
 e uuid:='e0000000-0000-4000-8000-000000000005';
 f uuid:='f0000000-0000-4000-8000-000000000006';
 g uuid:='a0000000-0000-4000-8000-000000000007';
 o_d uuid:='d1111111-1111-4111-8111-111111111111';
 o_e uuid:='e1111111-1111-4111-8111-111111111111';
 o_f uuid:='f1111111-1111-4111-8111-111111111111';
 o_g uuid:='a7111111-1111-4111-8111-111111111111';
 r_d uuid:='d2222222-2222-4222-8222-222222222222';
 r_e uuid:='e2222222-2222-4222-8222-222222222222';
 x jsonb;
begin
 -- Purchase CNY using two original wallets, only part refundable principal.
 insert into public.sasi_wallets(user_id,available_points,refundable_points) values(d,2000,1000);
 insert into public.ai_wallets(user_id,available_fen,refundable_fen) values(d,5000,800);
 x:=public.purchase_tool_pass_v2(d,o_d,'tools_7d','CNY');
 if x->>'ok' IS DISTINCT FROM 'true' then raise exception 'CNY_PURCHASE_FAILED %',x;end if;
 x:=public.refund_unused_tool_pass_wallet_v2(d,o_d,r_d);
 if x->>'ok' IS DISTINCT FROM 'true' or x->>'destination' IS DISTINCT FROM 'original_wallets_only'
 then raise exception 'CNY_WALLET_REFUND_FAILED %',x;end if;
 if (select available_points from public.sasi_wallets where user_id=d)<>2000
  or (select refundable_points from public.sasi_wallets where user_id=d)<>1000
  or (select available_fen from public.ai_wallets where user_id=d)<>5000
  or (select refundable_fen from public.ai_wallets where user_id=d)<>800
 then raise exception 'CNY_WALLET_OR_PRINCIPAL_NOT_RESTORED';end if;
 if (select count(*) from public.sasi_credit_ledger where user_id=d and kind='refund')<>1
   or (select count(*) from public.ai_wallet_ledger where user_id=d and kind='tool_pass_refund_v2')<>1
 then raise exception 'CNY_LEDGER_REVERSAL_MISSING';end if;
 x:=public.refund_unused_tool_pass_wallet_v2(d,o_d,r_d);
 if x->>'alreadyRefunded' IS DISTINCT FROM 'true' then raise exception 'REFUND_REPLAY_NOT_IDEMPOTENT %',x;end if;
 x:=public.refund_unused_tool_pass_wallet_v2(d,o_d,'d3333333-3333-4333-8333-333333333333');
 if x->>'error' IS DISTINCT FROM 'REFUND_IDEMPOTENCY_CONFLICT' then raise exception 'DOUBLE_REFUND_ALLOWED %',x;end if;
 if (select count(*) from public.tool_pass_wallet_refunds_v2 where order_id=o_d)<>1
 then raise exception 'DUPLICATE_REFUND_JOURNAL';end if;
 x:=public.refund_unused_tool_pass_wallet_v2(e,o_d,'e3333333-3333-4333-8333-333333333333');
 if x->>'error' IS DISTINCT FROM 'ORDER_NOT_FOUND' then raise exception 'CROSS_USER_REFUND_ACCEPTED %',x;end if;
 -- USD is a separate source wallet and must not touch CNY balances.
 insert into public.sasi_usd_wallets(user_id,available_cents,refundable_cents) values(e,2000,1000);
 insert into public.ai_usd_wallets(user_id,available_cents,refundable_cents) values(e,10000,3000);
 x:=public.purchase_tool_pass_v2(e,o_e,'tools_30d','USD');
 if x->>'ok' IS DISTINCT FROM 'true' then raise exception 'USD_PURCHASE_FAILED %',x;end if;
 x:=public.refund_unused_tool_pass_wallet_v2(e,o_e,r_e);
 if x->>'ok' IS DISTINCT FROM 'true' then raise exception 'USD_REFUND_FAILED %',x;end if;
 if (select available_cents from public.sasi_usd_wallets where user_id=e)<>2000
  or (select refundable_cents from public.sasi_usd_wallets where user_id=e)<>1000
  or (select available_cents from public.ai_usd_wallets where user_id=e)<>10000
  or (select refundable_cents from public.ai_usd_wallets where user_id=e)<>3000
 then raise exception 'USD_WALLET_OR_PRINCIPAL_NOT_RESTORED';end if;
 if (select count(*) from public.sasi_usd_wallet_ledger where user_id=e and kind='tool_pass_refund_v2')<>1
  or (select count(*) from public.ai_usd_wallet_ledger where user_id=e and kind='tool_pass_refund_v2')<>1
 then raise exception 'USD_REFUND_LEDGER_MISSING';end if;
 -- A processing start under the exact purchased pass permanently disallows
 -- an automatic UNUSED refund even if the user never exports a file.
 insert into public.sasi_wallets(user_id,available_points,refundable_points) values(f,2000,2000);
 insert into public.ai_wallets(user_id,available_fen,refundable_fen) values(f,5000,5000);
 x:=public.purchase_tool_pass_v2(f,o_f,'tools_7d','CNY');
 if x->>'ok' IS DISTINCT FROM 'true' then raise exception 'USED_FIXTURE_PURCHASE_FAILED';end if;
 x:=public.claim_tool_pass_use_v2(f,'f4444444-4444-4444-8444-444444444444','ocr',repeat('f',64));
 if x->>'passOrderId' IS DISTINCT FROM o_f::text then raise exception 'USED_PASS_NOT_BOUND_TO_ORDER %',x;end if;
 x:=public.refund_unused_tool_pass_wallet_v2(f,o_f,'f3333333-3333-4333-8333-333333333333');
 if x->>'error' IS DISTINCT FROM 'PASS_ALREADY_USED' then raise exception 'USED_PASS_REFUNDED %',x;end if;
 if (select state from public.tool_pass_orders_v2 where request_id=o_f)<>'active'
 then raise exception 'USED_PASS_STATE_CHANGED';end if;
 -- Forged/missing original debits must fail closed, no wallet credit.
 insert into public.sasi_wallets(user_id,available_points,refundable_points) values(g,2000,2000);
 insert into public.ai_wallets(user_id,available_fen,refundable_fen) values(g,5000,5000);
 x:=public.purchase_tool_pass_v2(g,o_g,'tools_7d','CNY');
 if x->>'ok' IS DISTINCT FROM 'true' then raise exception 'TAMPER_FIXTURE_PURCHASE_FAILED';end if;
 update public.sasi_credit_ledger set delta_available=-1
 where user_id=g and kind='usage_v49' and reference_id='toolpass-v2:'||o_g::text;
 x:=public.refund_unused_tool_pass_wallet_v2(g,o_g,'a7333333-3333-4333-8333-333333333333');
 if x->>'error' IS DISTINCT FROM 'SOURCE_LEDGER_MISMATCH' then raise exception 'TAMPERED_LEDGER_REFUNDED %',x;end if;
 if (select count(*) from public.tool_pass_wallet_refunds_v2 where order_id=o_g)<>0
 then raise exception 'FORGED_LEDGER_JOURNALED';end if;
 if has_function_privilege('anon','public.refund_unused_tool_pass_wallet_v2(uuid,uuid,uuid)','EXECUTE')
  or has_function_privilege('authenticated','public.refund_unused_tool_pass_wallet_v2(uuid,uuid,uuid)','EXECUTE')
 then raise exception 'PUBLIC_REFUND_RPC_EXPOSED';end if;
 raise notice 'TOOL_PASS_V2_ORIGINAL_WALLET_REFUND_ACCEPTANCE_OK';
end $$;
