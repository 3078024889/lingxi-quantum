begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 b uuid:='22222222-2222-4222-8222-222222222222';
 r uuid:='f1111111-1111-4111-8111-111111111111';
 task uuid:='f2222222-2222-4222-8222-222222222222';
 other uuid:='f3333333-3333-4333-8333-333333333333';
 v jsonb;
begin
 v:=public.lingxi_claim_tool_use(r,a,repeat('f',64),'pdf-editor',1);
 if v->>'ok'<>'true' then raise exception 'CLAIM_FAILED %',v;end if;
 v:=public.lingxi_redeem_tool_use(r,a,'pdf-editor',task);
 if v->>'ok'<>'true' or v->>'alreadyRedeemed'<>'false' then raise exception 'FIRST_REDEMPTION_FAILED %',v;end if;
 v:=public.lingxi_redeem_tool_use(r,a,'pdf-editor',task);
 if v->>'ok'<>'true' or v->>'alreadyRedeemed'<>'true' then raise exception 'RETRY_NOT_IDEMPOTENT %',v;end if;
 v:=public.lingxi_redeem_tool_use(r,a,'pdf-editor',other);
 if v->>'error'<>'TOOL_USE_RECEIPT_ALREADY_USED' then raise exception 'OTHER_TASK_BYPASS %',v;end if;
 v:=public.lingxi_redeem_tool_use(r,b,'pdf-editor',task);
 if v->>'error'<>'TOOL_USE_RECEIPT_INVALID' then raise exception 'OTHER_ACCOUNT_BYPASS %',v;end if;
 v:=public.lingxi_redeem_tool_use(r,a,'image-to-pdf',task);
 if v->>'error'<>'TOOL_USE_RECEIPT_INVALID' then raise exception 'CROSS_TOOL_BYPASS %',v;end if;
 v:=public.lingxi_redeem_tool_use(other,a,'pdf-editor',task);
 if v->>'error'<>'TOOL_USE_RECEIPT_INVALID' then raise exception 'UNCLAIMED_TICKET_BYPASS %',v;end if;
end $$;
do $$
begin
 if has_function_privilege('anon','public.lingxi_redeem_tool_use(uuid,uuid,text,uuid)','EXECUTE')
 or has_function_privilege('authenticated','public.lingxi_redeem_tool_use(uuid,uuid,text,uuid)','EXECUTE')
 then raise exception 'REDEMPTION_PUBLIC_ACCESS';end if;
end $$;
rollback;
