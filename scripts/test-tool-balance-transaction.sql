begin;
do $$
declare uid uuid:=gen_random_uuid(); other_id uuid:=gen_random_uuid(); qid uuid; usd_id uuid; result jsonb; available bigint; n integer;
begin
 insert into auth.users(id,aud,role) values(uid,'authenticated','authenticated'),(other_id,'authenticated','authenticated');
 insert into public.sasi_wallets(user_id,available_points,refundable_points) values(uid,1000,1000);
 insert into public.sasi_usd_wallets(user_id,available_cents,refundable_cents) values(uid,1000,1000);
 insert into public.tool_payment_quotes(user_id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,currency) values(uid,'pdf-editor','per_page',1,'page',2,1,'CNY') returning id into qid;
 result:=public.pay_tool_quote_with_sasi_balance(other_id,qid);if result->>'error'<>'QUOTE_NOT_FOUND' then raise exception 'ownership failed';end if;
 result:=public.pay_tool_quote_with_sasi_balance(uid,qid);if result->>'paid'<>'true' then raise exception 'CNY pay failed: %',result;end if;
 result:=public.pay_tool_quote_with_sasi_balance(uid,qid);if result->>'alreadyPaid'<>'true' then raise exception 'replay failed';end if;
 select available_points into available from public.sasi_wallets where user_id=uid;if available<>800 then raise exception 'replay charged again';end if;
 select count(*) into n from public.orders where user_id=uid and product_id='toolquote:'||qid::text;if n<>1 then raise exception 'duplicate orders';end if;
 insert into public.tool_payment_quotes(user_id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,currency) values(uid,'pdf-editor','per_page',1,'page',20,1,'CNY') returning id into qid;
 result:=public.pay_tool_quote_with_sasi_balance(uid,qid);if result->>'error'<>'SASI_BALANCE_INSUFFICIENT' then raise exception 'insufficient failed';end if;
 if exists(select 1 from public.orders where user_id=uid and product_id='toolquote:'||qid::text) then raise exception 'insufficient created order';end if;
 update public.tool_payment_quotes set expires_at=now()-interval '1 minute' where id=qid;
 result:=public.pay_tool_quote_with_sasi_balance(uid,qid);if result->>'error'<>'QUOTE_EXPIRED' then raise exception 'expiry failed';end if;
 update public.tool_payment_quotes set expires_at=now()+interval '1 minute',status='ordered' where id=qid;
 result:=public.pay_tool_quote_with_sasi_balance(uid,qid);if result->>'error'<>'PAYMENT_ALREADY_STARTED' then raise exception 'external checkout conflict failed';end if;
 insert into public.tool_payment_quotes(user_id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,currency) values(uid,'pdf-editor','per_page',1,'page',2,1,'USD') returning id into usd_id;
 result:=public.pay_tool_quote_with_sasi_balance(uid,usd_id);if result->>'paid'<>'true' then raise exception 'USD pay failed: %',result;end if;
 select available_cents into available from public.sasi_usd_wallets where user_id=uid;if available<>900 then raise exception 'USD incorrect';end if;
 select available_points into available from public.sasi_wallets where user_id=uid;if available<>800 then raise exception 'currency mixed';end if;
 if not exists(select 1 from public.tool_export_grants where quote_id=usd_id and user_id=uid) then raise exception 'missing tool grant';end if;
end $$;
select 'PASS: CNY/USD, ownership, replay, insufficient, expired, checkout conflict, grants; all fixtures rolled back' as verification;
rollback;
