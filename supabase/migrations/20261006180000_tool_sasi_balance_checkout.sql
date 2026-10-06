begin;
-- Existing usage RPC writes usage_v49; keep every existing allowed ledger kind.
alter table public.sasi_credit_ledger drop constraint sasi_credit_ledger_kind_check;
alter table public.sasi_credit_ledger add constraint sasi_credit_ledger_kind_check check (kind in ('topup','reserve','settle','release','refund','adjustment','withdrawal_hold','withdrawal_release','withdrawal_complete','usage_v49'));

create or replace function public.pay_tool_quote_with_sasi_balance(p_user_id uuid,p_quote_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare q public.tool_payment_quotes%rowtype; oid uuid; c text; minor bigint; charged jsonb; fulfilled jsonb;
begin
 if p_user_id is null or p_quote_id is null then return jsonb_build_object('ok',false,'error','INVALID_QUOTE_ID'); end if;
 -- Quote lock is the common boundary with external checkout. All financial writes are one transaction.
 select * into q from public.tool_payment_quotes where id=p_quote_id and user_id=p_user_id for update;
 if not found then return jsonb_build_object('ok',false,'error','QUOTE_NOT_FOUND'); end if;
 if q.status='paid' then
  if exists(select 1 from public.tool_export_grants where quote_id=q.id and user_id=p_user_id) then return jsonb_build_object('ok',true,'paid',true,'alreadyPaid',true); end if;
  return jsonb_build_object('ok',false,'error','PAYMENT_FULFILLMENT_PENDING');
 end if;
 if q.status<>'quoted' then return jsonb_build_object('ok',false,'error','PAYMENT_ALREADY_STARTED'); end if;
 if q.expires_at<=now() then return jsonb_build_object('ok',false,'error','QUOTE_EXPIRED'); end if;
 c:=coalesce(q.currency,q.metadata->>'pricing_currency');
 if c not in ('CNY','USD') or c is null then return jsonb_build_object('ok',false,'error','QUOTE_CURRENCY_MISSING'); end if;
 minor:=round(case when c='USD' then q.amount_usd else q.amount_rmb end *100)::bigint;
 if minor is null or minor<=0 then return jsonb_build_object('ok',false,'error','INVALID_QUOTE_AMOUNT'); end if;
 if q.parent_quote_id is not null then
  perform 1 from public.tool_export_grants where quote_id=q.parent_quote_id and user_id=p_user_id and tool_id=q.tool_id for update;
  if not found then return jsonb_build_object('ok',false,'error','PARENT_GRANT_NOT_FOUND'); end if;
 end if;
 charged:=public.charge_sasi_usage_v49(p_user_id,c,minor,'toolquote:'||q.id::text,'paid-tool',jsonb_build_object('quoteId',q.id,'toolId',q.tool_id,'quantity',q.quantity));
 if coalesce((charged->>'ok')::boolean,false) is not true then return charged; end if;
 insert into public.orders(user_id,product_id,product_type,amount_rmb,amount_usd,currency,status,provider,submission_name)
 values(p_user_id,'toolquote:'||q.id::text,'permanent',q.amount_rmb,q.amount_usd,c,'pending','sasi-balance','工具：'||q.tool_id) returning id into oid;
 fulfilled:=public.fulfill_tool_order(oid);
 if coalesce((fulfilled->>'ok')::boolean,false) is not true or not exists(select 1 from public.tool_export_grants where quote_id=q.id and user_id=p_user_id) then
  raise exception 'TOOL_BALANCE_FULFILLMENT_FAILED';
 end if;
 update public.orders set paid_at=coalesce(paid_at,now()) where id=oid;
 return jsonb_build_object('ok',true,'paid',true,'orderId',oid,'currency',c,'chargedMinor',minor,'availableMinor',charged->'availableMinor');
end $$;
revoke all on function public.pay_tool_quote_with_sasi_balance(uuid,uuid) from public,anon,authenticated;
grant execute on function public.pay_tool_quote_with_sasi_balance(uuid,uuid) to service_role;
commit;
