-- Fix refund-per-order ceiling when a top-up was partially consumed by adjustment debt.
-- credit_ai_topup stores grossFen in ledger metadata; delta_available_fen may be net of debt offset.
create or replace function public.request_ai_refund(p_user_id uuid,p_order_id uuid,p_amount_fen bigint,p_note text default null)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare v public.ai_wallets%rowtype; o public.orders%rowtype; topup_fen bigint; already_requested bigint; req_id uuid;
begin
 if p_amount_fen<=0 then return jsonb_build_object('ok',false,'error','INVALID_AMOUNT'); end if;
 select * into o from public.orders where id=p_order_id and user_id=p_user_id for update;
 if not found or o.status<>'paid' then return jsonb_build_object('ok',false,'error','ORDER_NOT_REFUNDABLE'); end if;
 select coalesce(nullif(metadata->>'grossFen','')::bigint,delta_available_fen) into topup_fen
 from public.ai_wallet_ledger
 where user_id=p_user_id and kind='topup' and reference_id=p_order_id::text order by created_at asc limit 1;
 if topup_fen is null then return jsonb_build_object('ok',false,'error','NOT_AI_TOPUP'); end if;
 select coalesce(sum(amount_fen),0) into already_requested from public.ai_refund_requests
 where order_id=p_order_id and status in ('requested','approved','completed');
 if already_requested+p_amount_fen>topup_fen then return jsonb_build_object('ok',false,'error','ORDER_REFUND_LIMIT'); end if;
 select * into v from public.ai_wallets where user_id=p_user_id for update;
 if p_amount_fen>v.available_fen or p_amount_fen>v.refundable_fen then return jsonb_build_object('ok',false,'error','INSUFFICIENT_UNUSED_PRINCIPAL'); end if;
 update public.ai_wallets set available_fen=available_fen-p_amount_fen,refund_hold_fen=refund_hold_fen+p_amount_fen,updated_at=now()
 where user_id=p_user_id returning * into v;
 insert into public.ai_refund_requests(user_id,order_id,amount_fen,note) values(p_user_id,p_order_id,p_amount_fen,left(coalesce(p_note,''),500)) returning id into req_id;
 insert into public.ai_wallet_ledger(user_id,kind,delta_available_fen,delta_refund_hold_fen,available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata)
 values(p_user_id,'refund_hold',-p_amount_fen,p_amount_fen,v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,req_id::text,jsonb_build_object('orderId',p_order_id,'amountFen',p_amount_fen));
 return jsonb_build_object('ok',true,'requestId',req_id);
end $$;
revoke all on function public.request_ai_refund(uuid,uuid,bigint,text) from public,anon,authenticated;
grant execute on function public.request_ai_refund(uuid,uuid,bigint,text) to service_role;
