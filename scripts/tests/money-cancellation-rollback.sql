-- Synthetic fixtures only; every write is rolled back. No provider requests.
begin;
do $$
declare u uuid:=gen_random_uuid(); o uuid; w uuid; k text; t text; a text; h text; r text; c text; result jsonb; available bigint; held bigint; n integer;
begin
 insert into auth.users(id,email,role,aud) values(u,'money-cancel-'||u||'@example.invalid','authenticated','authenticated');
 foreach k in array array['ai_cny','sasi_cny','ai_usd','sasi_usd'] loop
  t:=case k when 'ai_cny' then 'ai_wallets' when 'sasi_cny' then 'sasi_wallets' when 'ai_usd' then 'ai_usd_wallets' else 'sasi_usd_wallets' end;
  a:=case k when 'ai_cny' then 'available_fen' when 'sasi_cny' then 'available_points' else 'available_cents' end;
  h:=case k when 'ai_cny' then 'refund_hold_fen' when 'sasi_cny' then 'refund_hold_points' else 'refund_hold_cents' end;
  r:=case k when 'ai_cny' then 'refundable_fen' when 'sasi_cny' then 'refundable_points' else 'refundable_cents' end;
  c:=case when k like '%usd' then 'USD' else 'CNY' end;
  execute format('insert into public.%I(user_id,%I,%I,%I) values($1,900,100,1000)',t,a,h,r) using u;
  o:=gen_random_uuid();w:=gen_random_uuid();
  insert into public.orders(id,user_id,product_id,product_type,amount_usd,amount_rmb,currency,provider,status) values(o,u,'fixture','sasi',10,10,c,case when c='USD' then 'paypal' else 'wechat' end,'paid');
  insert into public.balance_withdrawals(id,user_id,order_id,wallet_kind,provider,currency,provider_currency,amount_minor,provider_amount_minor,provider_request_key) values(w,u,o,k,case when c='USD' then 'paypal' else 'wechat' end,c,c,100,100,'fixture-'||w);
  result:=public.money_begin_provider_call(w);if result->>'ok'<>'false' then raise exception 'unconfirmed request reached provider';end if;
  result:=public.cancel_balance_withdrawal(w,gen_random_uuid());if result->>'error'<>'WITHDRAWAL_NOT_FOUND' then raise exception 'ownership bypass';end if;
  result:=public.cancel_balance_withdrawal(w,u);if result->>'ok'<>'true' then raise exception 'cancel failed: %',result;end if;
  result:=public.cancel_balance_withdrawal(w,u);if result->>'ok'<>'true' then raise exception 'repeat cancel failed';end if;
  execute format('select %I,%I from public.%I where user_id=$1',a,h,t) into available,held using u;
  if available<>1000 or held<>0 then raise exception 'wallet mismatch % % %',k,available,held;end if;
  select count(*) into n from public.money_notification_outbox where withdrawal_id=w;
  if n<>2 or exists(select 1 from public.money_notification_outbox where withdrawal_id=w and event_type='failed') then raise exception 'incorrect cancellation notifications';end if;
  begin update public.balance_withdrawals set status='processing' where id=w;raise exception 'cancelled request revived';exception when others then if SQLERRM<>'CANCELLED_REQUEST_FINAL' then raise;end if;end;
  execute format('update public.%I set %I=900,%I=100 where user_id=$1',t,a,h) using u;
  w:=gen_random_uuid();
  insert into public.balance_withdrawals(id,user_id,order_id,wallet_kind,provider,currency,provider_currency,amount_minor,provider_amount_minor,provider_request_key) values(w,u,o,k,case when c='USD' then 'paypal' else 'wechat' end,c,c,100,100,'fixture-'||w);
  result:=public.confirm_balance_withdrawal_submission(w,u);if result->>'ok'<>'true' then raise exception 'confirmation failed';end if;
  result:=public.money_begin_provider_call(w);if result->>'ok'<>'true' then raise exception 'provider lease failed';end if;
  result:=public.money_begin_provider_call(w);if result->>'ok'<>'false' then raise exception 'duplicate provider call';end if;
  result:=public.cancel_balance_withdrawal(w,u);if result->>'error'<>'CANCELLATION_NOT_AVAILABLE' then raise exception 'confirmed request cancelled';end if;
 end loop;
 update public.ai_wallets set available_fen=900,refund_hold_fen=100 where user_id=u;
 o:=gen_random_uuid();w:=gen_random_uuid();
 insert into public.orders(id,user_id,product_id,product_type,amount_usd) values(o,u,'legacy-fixture','ai',10);
 insert into public.ai_refund_requests(id,user_id,order_id,amount_fen) values(w,u,o,100);
 result:=public.cancel_legacy_refund(w,gen_random_uuid());if result->>'error'<>'WITHDRAWAL_NOT_FOUND' then raise exception 'legacy ownership bypass';end if;
 result:=public.cancel_legacy_refund(w,u);if result->>'ok'<>'true' then raise exception 'legacy cancel failed';end if;
 result:=public.cancel_legacy_refund(w,u);if result->>'ok'<>'true' then raise exception 'legacy repeat cancel failed';end if;
 select available_fen,refund_hold_fen into available,held from public.ai_wallets where user_id=u;
 if available<>1000 or held<>0 then raise exception 'legacy wallet mismatch';end if;
 if has_function_privilege('authenticated','public.cancel_balance_withdrawal(uuid,uuid)','EXECUTE') or has_function_privilege('anon','public.money_operator_snapshot()','EXECUTE') then raise exception 'public privileged RPC';end if;
end $$;
rollback;
select 'PASS: four wallets, ownership, repeat cancellation, restored funds, finality, confirmation/lease protection; synthetic writes rolled back' as result;
