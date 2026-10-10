set search_path=public,pg_temp;
-- Order-scoped alternative verified in isolated PostgreSQL. No global triggers,
-- no replacement of existing charging functions, no debt or account freeze.
-- Historical credits below the cutover sequence remain manual review.
alter table sasi_credit_ledger add column entry_sequence bigint generated always as identity;
create table mini_refund_cutover(id integer primary key,first_sequence bigint not null);
insert into mini_refund_cutover values(1,coalesce((select max(entry_sequence)+1 from sasi_credit_ledger),1));
create table mini_refund_reviews(order_id uuid primary key references orders(id),user_id uuid not null,refunded_fen bigint not null default 0 check(refunded_fen>=0),recovered_fen bigint not null default 0 check(recovered_fen>=0 and recovered_fen<=refunded_fen),review_fen bigint not null default 0 check(review_fen>=0),needs_review boolean not null default false,reason text,provider_refund_id text not null,updated_at timestamptz not null default now());
alter table tool_export_grants add column revoked_at timestamptz;
create function mini_order_refund_v1(p_order_id uuid,p_cumulative_fen bigint,p_refund_id text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare o orders%rowtype;w sasi_wallets%rowtype;r mini_refund_reviews%rowtype;source sasi_credit_ledger%rowtype;q tool_payment_quotes%rowtype;g tool_export_grants%rowtype;
 amount bigint;delta bigint;spent bigint:=0;take bigint:=0;unresolved bigint:=0;why text:='';review boolean:=false;
begin
 select * into o from orders where id=p_order_id for update;
 if not found or o.provider<>'wechat_mini_virtual' or o.currency<>'CNY' then return jsonb_build_object('ok',false,'error','INVALID_MINI_ORDER');end if;
 amount:=round(o.amount_rmb*100)::bigint;
 if amount is null or amount<=0 or p_cumulative_fen is null or p_cumulative_fen<=0 or p_cumulative_fen>amount or coalesce(length(p_refund_id),0) not between 1 and 128 then return jsonb_build_object('ok',false,'error','INVALID_REFUND');end if;
 insert into mini_refund_reviews(order_id,user_id,provider_refund_id) values(o.id,o.user_id,p_refund_id) on conflict do nothing;
 select * into r from mini_refund_reviews where order_id=o.id for update;
 if p_cumulative_fen<=r.refunded_fen then return jsonb_build_object('ok',true,'alreadyProcessed',true);end if;
 delta:=p_cumulative_fen-r.refunded_fen;
 if o.product_id like 'sasi-balance-%' then
  select * into w from sasi_wallets where user_id=o.user_id for update;
  select * into source from sasi_credit_ledger where user_id=o.user_id and kind='topup' and reference_id=o.id::text and entry_sequence >= (select first_sequence from mini_refund_cutover where id=1);
  if found and source.delta_available=amount then
   -- Conservative provenance: all later decreases count as use of this recharge.
   -- Ignore only refunds of this same order; they are accounted by r.recovered_fen.
   select coalesce(sum(-delta_available),0) into spent from sasi_credit_ledger where user_id=o.user_id and entry_sequence>source.entry_sequence and delta_available<0 and coalesce(metadata->>'miniRefundOrder','')<>o.id::text;
   take:=least(delta,greatest(0,source.delta_available-spent-r.recovered_fen),coalesce(w.available_points,0));
  end if;
  if take>0 then
   update sasi_wallets set available_points=available_points-take,refundable_points=greatest(0,refundable_points-take),updated_at=now() where user_id=o.user_id returning * into w;
   insert into sasi_credit_ledger(user_id,kind,delta_available,delta_reserved,available_after,reserved_after,reference_id,metadata) values(o.user_id,'refund',-take,0,w.available_points,w.reserved_points,'mini-refund:'||o.id||':'||p_cumulative_fen,jsonb_build_object('miniRefundOrder',o.id,'currency','CNY'));
  end if;
  unresolved:=delta-take;review:=unresolved>0;why:=case when review then '已使用、冻结或历史来源需管理员核对；未追扣其他资金' else '' end;
 elsif o.product_id like 'toolquote:%' then
  select * into q from tool_payment_quotes where id=substring(o.product_id from 11)::uuid and user_id=o.user_id for update;
  if not found then raise exception 'REFUND_QUOTE_MISSING';end if;
  select * into g from tool_export_grants where quote_id=q.id and user_id=o.user_id for update;
  if p_cumulative_fen=amount and q.parent_quote_id is null and not exists(select 1 from tool_payment_quotes where parent_quote_id=q.id and status='paid') then
   update tool_export_grants set revoked_at=coalesce(revoked_at,now()) where quote_id=q.id and user_id=o.user_id;
   update tool_payment_quotes set status='canceled' where id=q.id;
   review:=g.consumed_at is not null or coalesce(g.consumed_quantity,0)>0;
   if review then unresolved:=delta;why:='已交付的工具退款需人工核对';end if;
  else
   -- Pause only this task's shared entitlement until the refund is reviewed.
   update tool_export_grants set revoked_at=coalesce(revoked_at,now()) where user_id=o.user_id and quote_id in(q.id,q.parent_quote_id);
   update tool_payment_quotes set status='canceled' where id=q.id;
   review:=true;unresolved:=delta;why:='部分退款或共享用量已暂停该任务，需人工核对';
  end if;
 else review:=true;unresolved:=delta;why:='旧商品订单需人工核对';end if;
 update mini_refund_reviews set refunded_fen=p_cumulative_fen,recovered_fen=recovered_fen+take,review_fen=review_fen+unresolved,needs_review=needs_review or review,reason=case when why='' then reason else why end,provider_refund_id=p_refund_id,updated_at=now() where order_id=o.id;
 if p_cumulative_fen=amount then update orders set status='refunded' where id=o.id;end if;
 return jsonb_build_object('ok',true,'recoveredFen',take,'reviewFen',unresolved,'needsReview',review);
end $$;


alter table public.mini_refund_cutover enable row level security;
alter table public.mini_refund_reviews enable row level security;
revoke all on public.mini_refund_cutover, public.mini_refund_reviews from public, anon, authenticated;
grant select on public.mini_refund_cutover to service_role;
grant select,insert,update on public.mini_refund_reviews to service_role;
revoke all on function public.mini_order_refund_v1(uuid,bigint,text) from public, anon, authenticated;
grant execute on function public.mini_order_refund_v1(uuid,bigint,text) to service_role;
-- Stop late fulfillment and retries from reopening refunded tool permissions.
CREATE OR REPLACE FUNCTION public.claim_tool_paid_job(p_quote_id uuid, p_user_id uuid, p_tool_id text, p_item_key text, p_units numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_grant public.tool_export_grants%rowtype;
  v_job public.tool_paid_jobs%rowtype;
begin
  if p_units is null or p_units <= 0 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_UNITS');
  end if;

  select * into v_grant
  from public.tool_export_grants
  where quote_id = p_quote_id and user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'PAID_GRANT_NOT_FOUND');
  end if;

  if v_grant.revoked_at is not null then
    return jsonb_build_object('ok',false,'error','PAID_GRANT_REVOKED');
  end if;

  if v_grant.tool_id <> p_tool_id then
    return jsonb_build_object('ok', false, 'error', 'TOOL_MISMATCH');
  end if;

  select * into v_job
  from public.tool_paid_jobs
  where quote_id = p_quote_id and item_key = p_item_key
  for update;

  if found then
    if v_job.user_id <> p_user_id or v_job.tool_id <> p_tool_id then
      return jsonb_build_object('ok', false, 'error', 'JOB_MISMATCH');
    end if;

    if v_job.status = 'failed' then
      update public.tool_paid_jobs
      set status='processing', error=null, updated_at=now()
      where id=v_job.id;
      return jsonb_build_object('ok', true, 'job_id', v_job.id, 'retry', true, 'status', 'processing');
    end if;

    return jsonb_build_object(
      'ok', true,
      'job_id', v_job.id,
      'existing', true,
      'status', v_job.status,
      'result', v_job.result,
      'provider_ref', v_job.provider_ref
    );
  end if;

  if v_grant.consumed_quantity + p_units > v_grant.quantity then
    return jsonb_build_object(
      'ok', false,
      'error', 'INSUFFICIENT_PAID_UNITS',
      'paid_units', v_grant.quantity,
      'used_units', v_grant.consumed_quantity,
      'requested_units', p_units
    );
  end if;

  update public.tool_export_grants
  set consumed_quantity = consumed_quantity + p_units,
      consumed_at = case when consumed_quantity + p_units >= quantity then now() else consumed_at end
  where id = v_grant.id;

  insert into public.tool_paid_jobs(user_id,quote_id,tool_id,item_key,units,status)
  values(p_user_id,p_quote_id,p_tool_id,p_item_key,p_units,'processing')
  returning * into v_job;

  return jsonb_build_object('ok', true, 'job_id', v_job.id, 'created', true, 'status', 'processing');
end
$function$
;
CREATE OR REPLACE FUNCTION public.fulfill_tool_order(p_order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_order public.orders%rowtype;
  v_quote public.tool_payment_quotes%rowtype;
  v_parent_grant public.tool_export_grants%rowtype;
  v_quote_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'ORDER_NOT_FOUND'); end if;

  if v_order.status not in ('pending','paid') then
    return jsonb_build_object('ok',false,'error','ORDER_NOT_PAYABLE');
  end if;

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

  if v_quote.status='canceled' or exists(select 1 from public.tool_export_grants where quote_id=coalesce(v_quote.parent_quote_id,v_quote.id) and revoked_at is not null) then
    return jsonb_build_object('ok',false,'error','PAID_GRANT_REVOKED');
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
$function$
;
CREATE OR REPLACE FUNCTION public.repair_tool_paid_grant(p_order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
  if v_quote.status='canceled' or exists(select 1 from public.tool_export_grants where quote_id=coalesce(v_quote.parent_quote_id,v_quote.id) and revoked_at is not null) then
    return jsonb_build_object('ok',false,'error','PAID_GRANT_REVOKED');
  end if;
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
$function$
;
