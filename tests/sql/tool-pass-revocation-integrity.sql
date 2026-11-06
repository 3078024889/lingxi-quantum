begin;
do $$
declare a uuid:='11111111-1111-4111-8111-111111111111';
 req uuid:='a1111111-1111-4111-8111-111111111111';
 op uuid:='a2222222-2222-4222-8222-222222222222';
 purchase uuid:='a3333333-3333-4333-8333-333333333333';
 v jsonb;
begin
 insert into public.lingxi_tool_passes(user_id,sku,currency,price_minor,purchase_request_id,starts_at,expires_at)
 values(a,'tool_pass_7d','CNY',2900,purchase,now()-interval '1 minute',now()+interval '7 days');
 v:=public.lingxi_claim_tool_use(req,a,repeat('e',64),'document-translate',1);
 if v->>'ok'<>'true' or v->>'accessKind'<>'pass' then raise exception 'PAID_CLAIM_FAIL %',v;end if;
 update public.lingxi_tool_passes set revoked_at=now(),revocation_reason='test-refund'
 where purchase_request_id=purchase;
 v:=public.lingxi_redeem_tool_use(req,a,'document-translate',op);
 if v->>'error'<>'PASS_REVOKED' then raise exception 'REVOKED_PASS_EXECUTED %',v;end if;
 v:=public.lingxi_purchase_tool_pass(a,purchase,'tool_pass_7d','CNY');
 if v->>'error'<>'PASS_PURCHASE_REVOKED' then raise exception 'REFUNDED_PURCHASE_REPLAY_REENABLED %',v;end if;
end $$;
rollback;
