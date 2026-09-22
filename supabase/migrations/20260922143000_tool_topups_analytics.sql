alter table public.tool_payment_quotes
  add column if not exists parent_quote_id uuid references public.tool_payment_quotes(id) on delete set null,
  add column if not exists topup_target_quantity numeric(12,3);

create index if not exists tool_payment_quotes_parent_idx
  on public.tool_payment_quotes(parent_quote_id);

create table if not exists public.tool_events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  tool_id text not null,
  event_type text not null check (event_type in (
    'tool_open','file_selected','process_started','process_completed',
    'process_failed','export_clicked','export_paid','tool_search'
  )),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tool_events_created_idx on public.tool_events(created_at desc);
create index if not exists tool_events_tool_created_idx on public.tool_events(tool_id,created_at desc);
create index if not exists tool_events_type_created_idx on public.tool_events(event_type,created_at desc);

alter table public.tool_events enable row level security;

-- 前端不直接写表；统一经过服务端 track API。
-- 管理汇总也由服务端 service_role 读取。

create or replace function public.fulfill_tool_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_quote public.tool_payment_quotes%rowtype;
  v_parent_grant public.tool_export_grants%rowtype;
  v_quote_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'ORDER_NOT_FOUND'); end if;

  if v_order.status = 'paid' then
    return jsonb_build_object('ok', true, 'alreadyPaid', true);
  end if;

  if v_order.product_id not like 'toolquote:%' then
    return jsonb_build_object('ok', false, 'error', 'NOT_TOOL_ORDER');
  end if;

  begin
    v_quote_id := substring(v_order.product_id from 11)::uuid;
  exception when others then
    return jsonb_build_object('ok', false, 'error', 'BAD_QUOTE_ID');
  end;

  select * into v_quote from public.tool_payment_quotes where id = v_quote_id for update;
  if not found or v_quote.user_id <> v_order.user_id then
    return jsonb_build_object('ok', false, 'error', 'QUOTE_NOT_FOUND');
  end if;

  if round(v_order.amount_rmb::numeric,2) <> round(v_quote.amount_rmb::numeric,2) then
    return jsonb_build_object('ok', false, 'error', 'AMOUNT_MISMATCH');
  end if;

  update public.orders set status='paid' where id=p_order_id;
  update public.tool_payment_quotes set status='paid' where id=v_quote.id;

  if v_quote.parent_quote_id is not null then
    select * into v_parent_grant
    from public.tool_export_grants
    where quote_id=v_quote.parent_quote_id and user_id=v_order.user_id
    for update;

    if not found then
      return jsonb_build_object('ok', false, 'error', 'PARENT_GRANT_NOT_FOUND');
    end if;

    update public.tool_export_grants
    set quantity = greatest(
      quantity + v_quote.quantity,
      coalesce(v_quote.topup_target_quantity, quantity + v_quote.quantity)
    ),
    consumed_at = null
    where id=v_parent_grant.id;

    insert into public.tool_export_grants(user_id,quote_id,order_id,tool_id,quantity,unit_name,amount_rmb)
    values(v_order.user_id,v_quote.id,p_order_id,v_quote.tool_id,v_quote.quantity,v_quote.unit_name,v_quote.amount_rmb)
    on conflict(quote_id) do nothing;
  else
    insert into public.tool_export_grants(user_id,quote_id,order_id,tool_id,quantity,unit_name,amount_rmb)
    values(v_order.user_id,v_quote.id,p_order_id,v_quote.tool_id,v_quote.quantity,v_quote.unit_name,v_quote.amount_rmb)
    on conflict(quote_id) do nothing;
  end if;

  insert into public.tool_usage_ledger(user_id,tool_id,usage_type,quantity,credits_used,order_id,metadata)
  values(
    v_order.user_id,
    v_quote.tool_id,
    case when v_quote.parent_quote_id is null then 'paid_export' else 'paid_topup' end,
    v_quote.quantity,
    0,
    p_order_id,
    jsonb_build_object('quote_id',v_quote.id,'parent_quote_id',v_quote.parent_quote_id)
  );

  return jsonb_build_object('ok', true);
end
$$;

revoke all on function public.fulfill_tool_order(uuid) from public, anon, authenticated;
grant execute on function public.fulfill_tool_order(uuid) to service_role;
