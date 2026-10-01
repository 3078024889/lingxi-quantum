-- Integration assertions. Entire transaction MUST be rolled back.
-- Uses an existing account only for foreign keys; never calls a payment provider.
begin;
do $$
declare u uuid; o uuid; k uuid; w uuid; a jsonb; b jsonb; n bigint; kind text;
begin
 select user_id into u from public.orders where status='paid' limit 1;
 if u is null then raise exception 'fixture user missing'; end if;
 foreach kind in array array['ai','sasi'] loop
  o:=gen_random_uuid(); k:=gen_random_uuid();
  insert into public.orders(id,user_id,product_id,product_type,amount_usd,amount_rmb,status,provider,provider_payment_id)
  values(o,u,kind||'-usd-balance-test','balance',10,0,'paid','paypal','ROLLBACK-'||o::text);
  if kind='ai' then
   insert into public.ai_usd_wallets(user_id,available_cents,refundable_cents) values(u,1000,1000)
   on conflict(user_id) do update set available_cents=1000,refundable_cents=1000,refund_hold_cents=0;
   insert into public.ai_usd_wallet_ledger(user_id,kind,delta_cents,reference_id) values(u,'topup',1000,o::text);
  else
   insert into public.sasi_usd_wallets(user_id,available_cents,refundable_cents) values(u,1000,1000)
   on conflict(user_id) do update set available_cents=1000,refundable_cents=1000,refund_hold_cents=0;
   insert into public.sasi_usd_wallet_ledger(user_id,kind,delta_available_cents,reference_id) values(u,'topup',1000,o::text);
  end if;
  a:=public.request_balance_withdrawal_v2(u,o,101,k,'ROLLBACK TEST');
  if (a->>'ok')::boolean is not true then raise exception 'request failed % %',kind,a;end if;
  w:=(a->>'withdrawalId')::uuid;
  b:=public.request_balance_withdrawal_v2(u,o,101,k,'ROLLBACK TEST');
  if b->>'withdrawalId'<>w::text then raise exception 'replay duplicated';end if;
  b:=public.request_balance_withdrawal_v2(u,o,102,k,'ROLLBACK TEST');
  if b->>'error'<>'REQUEST_CONFLICT' then raise exception 'conflict not rejected';end if;
  a:=public.complete_balance_withdrawal(w,'ROLLBACK-RECEIPT','COMPLETED');
  if (a->>'ok')::boolean is not true then raise exception 'completion failed %',a;end if;
  a:=public.complete_balance_withdrawal(w,'ROLLBACK-RECEIPT','COMPLETED');
  if (a->>'ok')::boolean is not true then raise exception 'completion replay failed';end if;
  if kind='ai' then select available_cents into n from public.ai_usd_wallets where user_id=u;
  else select available_cents into n from public.sasi_usd_wallets where user_id=u;end if;
  if n<>899 then raise exception 'wrong final balance %',n;end if;
  a:=public.request_balance_withdrawal_v2(u,o,100,gen_random_uuid(),'ROLLBACK RELEASE');
  if (a->>'ok')::boolean is not true then raise exception 'second request failed %',a;end if;
  a:=public.release_balance_withdrawal((a->>'withdrawalId')::uuid,'ROLLBACK','CLOSED');
  if (a->>'ok')::boolean is not true then raise exception 'release failed %',a;end if;
 end loop;
 if has_function_privilege('anon','public.request_balance_withdrawal_v2(uuid,uuid,bigint,uuid,text)','EXECUTE') or
    has_function_privilege('authenticated','public.migrate_balance_refund_v2(uuid,uuid)','EXECUTE') then
  raise exception 'unsafe public refund RPC';
 end if;
end $$;
rollback;
