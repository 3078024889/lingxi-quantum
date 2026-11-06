begin;
do $$
declare
 owner uuid:='11111111-1111-4111-8111-111111111111';
 stranger uuid:='22222222-2222-4222-8222-222222222222';
 order_id uuid:='ed111111-1111-4111-8111-111111111111';
 quote_id uuid:='ed222222-2222-4222-8222-222222222222';
 other_quote uuid:='ed333333-3333-4333-8333-333333333333';
 v jsonb;
begin
 insert into public.orders(id,user_id,product_id,product_type,amount_rmb,amount_usd,status)
 values(order_id,owner,'toolquote:'||quote_id,'tool',9,9,'paid');
 insert into public.tool_payment_quotes(id,user_id,tool_id,status)
 values(quote_id,owner,'video-dubbing','paid'),(other_quote,owner,'video-dubbing','paid');
 insert into public.tool_export_grants(quote_id,user_id,order_id,tool_id)
 values(quote_id,owner,order_id,'video-dubbing');
 v:=public.lingxi_claim_legacy_media_execution(quote_id,stranger,'transcribe',repeat('a',64));
 if v->>'error'<>'QUOTE_NOT_PAID' then raise exception 'CROSS_ACCOUNT %',v;end if;
 v:=public.lingxi_claim_legacy_media_execution(quote_id,owner,'wrong',repeat('a',64));
 if v->>'error'<>'MEDIA_EXECUTION_INVALID' then raise exception 'INVALID_STAGE %',v;end if;
 v:=public.lingxi_claim_legacy_media_execution(other_quote,owner,'transcribe',repeat('a',64));
 if v->>'error'<>'QUOTE_DELIVERY_RIGHT_NOT_FOUND' then raise exception 'UNPROVEN_PAYMENT %',v;end if;
 v:=public.lingxi_claim_legacy_media_execution(quote_id,owner,'transcribe',repeat('a',64));
 if v->>'ok'<>'true' then raise exception 'FIRST_JOB_DENIED %',v;end if;
 v:=public.lingxi_claim_legacy_media_execution(quote_id,owner,'transcribe',repeat('a',64));
 if v->>'error'<>'QUOTE_OPERATION_ALREADY_USED' then raise exception 'SAME_JOB_REPLAY %',v;end if;
 v:=public.lingxi_claim_legacy_media_execution(quote_id,owner,'transcribe',repeat('b',64));
 if v->>'error'<>'QUOTE_OPERATION_ALREADY_USED' then raise exception 'DIFFERENT_PAYLOAD_REPLAY %',v;end if;
 v:=public.lingxi_claim_legacy_media_execution(quote_id,owner,'translate',repeat('a',64));
 if v->>'ok'<>'true' then raise exception 'VALID_NEXT_STAGE_DENIED %',v;end if;
 update public.orders set status='refunded' where id=order_id;
 v:=public.lingxi_claim_legacy_media_execution(quote_id,owner,'tts',repeat('a',64));
 if v->>'error'<>'QUOTE_DELIVERY_RIGHT_NOT_FOUND' then raise exception 'REFUNDED_REPLAY %',v;end if;
end $$;
do $$ begin
 if has_function_privilege('anon','public.lingxi_claim_legacy_media_execution(uuid,uuid,text,text)','EXECUTE')
 or has_function_privilege('authenticated','public.lingxi_claim_legacy_media_execution(uuid,uuid,text,text)','EXECUTE')
 then raise exception 'PUBLIC_RPC_ACCESS';end if;
end $$;
rollback;
