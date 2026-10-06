begin;
do $$
declare uid uuid:=gen_random_uuid();r jsonb; qid uuid; active bigint; legacy bigint; ref text:=gen_random_uuid()::text;
begin
 insert into auth.users(id,aud,role) values(uid,'authenticated','authenticated');
 insert into public.ai_wallets(user_id,available_fen,refundable_fen,refund_hold_fen,reserved_fen) values(uid,500,500,100,50);
 insert into public.ai_usd_wallets(user_id,available_cents,refundable_cents,refund_hold_cents,reserved_cents) values(uid,500,500,100,50);
 insert into public.tool_payment_quotes(user_id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,currency) values(uid,'pdf-editor','per_page',1,'page',2,2,'CNY') returning id into qid;
 r:=public.pay_tool_quote_with_sasi_balance(uid,qid);if r->>'paid'<>'true' then raise exception 'legacy CNY quote failed: %',r;end if;
 select available_fen into legacy from public.ai_wallets where user_id=uid;if legacy<>300 then raise exception 'legacy CNY wrong';end if;
 r:=public.pay_tool_quote_with_sasi_balance(uid,qid);if r->>'alreadyPaid'<>'true' then raise exception 'quote replay';end if;
 update public.sasi_wallets set available_points=100,refundable_points=100 where user_id=uid;
 r:=public.charge_sasi_usage_v49(uid,'CNY',200,ref,'test');if r->>'ok'<>'true' or r->>'legacyChargedMinor'<>'100' then raise exception 'combined CNY failed: %',r;end if;
 r:=public.charge_sasi_usage_v49(uid,'CNY',200,ref,'test');if r->>'alreadyCharged'<>'true' then raise exception 'mixed replay failed';end if;
 r:=public.charge_sasi_usage_v49(uid,'CNY',201,ref,'test');if r->>'error'<>'CHARGE_REFERENCE_CONFLICT' then raise exception 'changed reference amount';end if;
 select available_fen into legacy from public.ai_wallets where user_id=uid;select available_points into active from public.sasi_wallets where user_id=uid;if legacy<>200 or active<>0 then raise exception 'CNY sum';end if;
 if not exists(select 1 from public.ai_wallets where user_id=uid and refundable_fen=200 and refund_hold_fen=100 and reserved_fen=50) then raise exception 'refund hold or reserve consumed';end if;
 r:=public.charge_sasi_usage_v49(uid,'CNY',201,gen_random_uuid()::text,'test');if r->>'error'<>'SASI_BALANCE_INSUFFICIENT' or r->>'availableMinor'<>'200' then raise exception 'insufficient aggregate';end if;
 select available_fen into legacy from public.ai_wallets where user_id=uid;if legacy<>200 then raise exception 'failed charge modified balance';end if;
 r:=public.charge_sasi_usage_v49(uid,'USD',200,gen_random_uuid()::text,'test');if r->>'ok'<>'true' or r->>'availableMinor'<>'300' then raise exception 'legacy USD failed: %',r;end if;
 update public.sasi_usd_wallets set available_cents=100,refundable_cents=100 where user_id=uid;
 r:=public.charge_sasi_usage_v49(uid,'USD',200,ref,'test');if r->>'ok'<>'true' or r->>'legacyChargedMinor'<>'100' then raise exception 'mixed USD failed';end if;
 r:=public.charge_sasi_usage_v49(uid,'USD',200,ref,'test');if r->>'alreadyCharged'<>'true' then raise exception 'USD replay';end if;
 if not exists(select 1 from public.ai_usd_wallets where user_id=uid and available_cents=200 and refundable_cents=200 and refund_hold_cents=100 and reserved_cents=50) then raise exception 'USD held consumed';end if;
 if (select sum(-delta_available_fen) from public.ai_wallet_ledger where user_id=uid and kind='usage_v49')<>300 then raise exception 'CNY source ledger';end if;
 if (select sum(-delta_cents) from public.ai_usd_wallet_ledger where user_id=uid and kind='usage_v49')<>300 then raise exception 'USD source ledger';end if;
end $$;
select 'PASS: existing-only and combined CNY/USD, actual quote fulfillment, replay, reference conflict, insufficient, reserve and refund holds excluded, source ledgers; all fixtures rolled back' as verification;
rollback;
