-- Only synthetic fixtures; no HTTP or real customer records.
begin;
do $$
declare u uuid:=gen_random_uuid(); o uuid; rid uuid; w uuid; k text; t text; a text; h text; r text; c text; p text; result jsonb; again jsonb; available bigint; held bigint; n integer;
begin
 insert into auth.users(id,email,role,aud) values(u,'money-request-'||u||'@example.invalid','authenticated','authenticated');
 foreach k in array array['ai_cny','sasi_cny','ai_usd','sasi_usd'] loop
  t:=case k when 'ai_cny' then 'ai_wallets' when 'sasi_cny' then 'sasi_wallets' when 'ai_usd' then 'ai_usd_wallets' else 'sasi_usd_wallets' end;
  a:=case k when 'ai_cny' then 'available_fen' when 'sasi_cny' then 'available_points' else 'available_cents' end;
  h:=case k when 'ai_cny' then 'refund_hold_fen' when 'sasi_cny' then 'refund_hold_points' else 'refund_hold_cents' end;
  r:=case k when 'ai_cny' then 'refundable_fen' when 'sasi_cny' then 'refundable_points' else 'refundable_cents' end;
  c:=case when k like '%usd' then 'USD' else 'CNY' end;
  p:=case k when 'ai_cny' then 'ai-balance-10' when 'sasi_cny' then 'sasi-balance-10' when 'ai_usd' then 'ai-usd-balance-10' else 'sasi-usd-balance-10' end;
  execute format('insert into public.%I(user_id,%I,%I) values($1,1000,1000)',t,a,r) using u;
  o:=gen_random_uuid();rid:=gen_random_uuid();
  insert into public.orders(id,user_id,product_id,product_type,amount_usd,amount_rmb,currency,provider,status) values(o,u,p,'sasi',10,10,c,case when c='USD' then 'paypal' else 'wechat' end,'paid');
  if k='ai_cny' then insert into public.ai_wallet_ledger(user_id,kind,delta_available_fen,reference_id) values(u,'topup',1000,o::text);
  elsif k='sasi_cny' then insert into public.sasi_credit_ledger(user_id,kind,delta_available,available_after,reserved_after,reference_id) values(u,'topup',1000,1000,0,o::text);
  elsif k='ai_usd' then insert into public.ai_usd_wallet_ledger(user_id,kind,delta_cents,reference_id) values(u,'topup',1000,o::text);
  else insert into public.sasi_usd_wallet_ledger(user_id,kind,delta_available_cents,reference_id) values(u,'topup',1000,o::text);end if;
  result:=public.request_balance_withdrawal_v2(u,o,400,rid,null);
  if result->>'ok'<>'true' then raise exception 'fresh request failed % %',k,result;end if;
  w:=(result->>'withdrawalId')::uuid;
  if not exists(select 1 from public.balance_withdrawals where id=w and provider_request_key='lf-refund-'||w::text and submission_confirmed_at is null) then raise exception 'missing stable key or draft safety';end if;
  again:=public.request_balance_withdrawal_v2(u,o,400,rid,null);
  if again->>'withdrawalId'<>w::text or again->>'replayed'<>'true' then raise exception 'replay failure';end if;
  execute format('select %I,%I from public.%I where user_id=$1',a,h,t) into available,held using u;
  if available<>600 or held<>400 then raise exception 'duplicate hold';end if;
  select count(*) into n from public.money_notification_outbox where withdrawal_id=w;
  if n<>1 then raise exception 'notice missing or duplicated';end if;
  result:=public.cancel_balance_withdrawal(w,u);
  if result->>'ok'<>'true' then raise exception 'cancel failed %',result;end if;
  execute format('select %I,%I from public.%I where user_id=$1',a,h,t) into available,held using u;
  if available<>1000 or held<>0 then raise exception 'cancel balance mismatch';end if;
 end loop;
end $$;
rollback;
select 'PASS: fresh 4-unit requests, stable provider keys, replay without double holds, atomic notices and cancellation across four wallets; all fixtures rolled back' as result;
