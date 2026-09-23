begin;

create or replace function public.repair_tool_paid_grant(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_quote public.tool_payment_quotes%rowtype;
  v_quote_id uuid;
  v_grant_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'ORDER_NOT_FOUND'); end if;
  if v_order.status <> 'paid' then return jsonb_build_object('ok', false, 'error', 'ORDER_NOT_PAID'); end if;
  if v_order.product_id not like 'toolquote:%' then return jsonb_build_object('ok', false, 'error', 'NOT_TOOL_ORDER'); end if;

  begin
    v_quote_id := substring(v_order.product_id from 11)::uuid;
  exception when others then
    return jsonb_build_object('ok', false, 'error', 'BAD_QUOTE_ID');
  end;

  select * into v_quote from public.tool_payment_quotes where id = v_quote_id for update;
  if not found or v_quote.user_id <> v_order.user_id then return jsonb_build_object('ok', false, 'error', 'QUOTE_NOT_FOUND'); end if;
  if round(v_order.amount_rmb::numeric,2) <> round(v_quote.amount_rmb::numeric,2) then return jsonb_build_object('ok', false, 'error', 'AMOUNT_MISMATCH'); end if;

  insert into public.tool_export_grants(user_id,quote_id,order_id,tool_id,quantity,unit_name,amount_rmb)
  values(v_order.user_id,v_quote.id,v_order.id,v_quote.tool_id,v_quote.quantity,v_quote.unit_name,v_quote.amount_rmb)
  on conflict(quote_id) do update set
    order_id=excluded.order_id,
    tool_id=excluded.tool_id,
    quantity=greatest(public.tool_export_grants.quantity,excluded.quantity),
    unit_name=excluded.unit_name,
    amount_rmb=excluded.amount_rmb
  returning id into v_grant_id;

  update public.tool_payment_quotes set status='paid' where id=v_quote.id and status<>'paid';

  if not exists(select 1 from public.tool_usage_ledger where order_id=v_order.id and tool_id=v_quote.tool_id and usage_type='paid_export') then
    insert into public.tool_usage_ledger(user_id,tool_id,usage_type,quantity,credits_used,order_id,metadata)
    values(v_order.user_id,v_quote.tool_id,'paid_export',v_quote.quantity,0,v_order.id,jsonb_build_object('quote_id',v_quote.id,'repair',true));
  end if;

  return jsonb_build_object('ok',true,'grant_id',v_grant_id,'repaired',true);
end;
$$;

revoke all on function public.repair_tool_paid_grant(uuid) from public;
revoke all on function public.repair_tool_paid_grant(uuid) from anon;
revoke all on function public.repair_tool_paid_grant(uuid) from authenticated;
grant execute on function public.repair_tool_paid_grant(uuid) to service_role;
grant execute on function public.repair_tool_paid_grant(uuid) to postgres;

insert into public.tool_pricing(
  tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,enabled
) values (
  'video-watermark-remover','per_minute','minute',0,1.20,1.20,49.00,'{}'::jsonb,true
)
on conflict(tool_id) do update set
  billing_type=excluded.billing_type,
  unit_name=excluded.unit_name,
  base_price_rmb=excluded.base_price_rmb,
  unit_price_rmb=excluded.unit_price_rmb,
  min_price_rmb=excluded.min_price_rmb,
  max_price_rmb=excluded.max_price_rmb,
  pricing_json=excluded.pricing_json,
  enabled=true;

commit;
