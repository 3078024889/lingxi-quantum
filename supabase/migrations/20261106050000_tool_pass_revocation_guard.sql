-- Refund and revocation must stop future paid work immediately.
begin;
create or replace function public.lingxi_redeem_tool_use(
 p_request_id uuid,p_user_id uuid,p_tool_slug text,p_operation_id uuid
)returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_use public.lingxi_tool_use_events%rowtype;
 v_receipt public.lingxi_tool_execution_receipts%rowtype;
 v_already boolean:=false;
begin
 if p_request_id is null or p_user_id is null or p_operation_id is null
 or p_tool_slug is null or p_tool_slug !~ '^[a-z0-9-]{1,96}$'
 then return jsonb_build_object('ok',false,'error','TOOL_USE_RECEIPT_REQUIRED');end if;
 select * into v_use from public.lingxi_tool_use_events
 where request_id=p_request_id for update;
 if not found or v_use.user_id<>p_user_id or v_use.tool_slug<>p_tool_slug
 or v_use.created_at<now()-interval '24 hours'
 then return jsonb_build_object('ok',false,'error','TOOL_USE_RECEIPT_INVALID');end if;
 -- A refunded or administratively revoked pass cannot fund new work.
 -- A naturally expired pass may finish a task started while it was valid.
 if v_use.access_kind='pass' and not exists(
   select 1 from public.lingxi_tool_passes p where p.user_id=p_user_id
   and p.revoked_at is null and p.starts_at<=v_use.created_at
   and p.expires_at>v_use.created_at
 ) then return jsonb_build_object('ok',false,'error','PASS_REVOKED');end if;
 insert into public.lingxi_tool_execution_receipts(request_id,user_id,tool_slug,operation_id)
 values(p_request_id,p_user_id,p_tool_slug,p_operation_id)
 on conflict(request_id) do nothing returning * into v_receipt;
 if not found then
  v_already:=true;
  select * into v_receipt from public.lingxi_tool_execution_receipts
   where request_id=p_request_id;
 end if;
 if not found or v_receipt.user_id<>p_user_id or v_receipt.tool_slug<>p_tool_slug
  or v_receipt.operation_id<>p_operation_id
 then return jsonb_build_object('ok',false,'error','TOOL_USE_RECEIPT_ALREADY_USED');end if;
 return jsonb_build_object('ok',true,'alreadyRedeemed',v_already);
end $$;
revoke all on function public.lingxi_redeem_tool_use(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.lingxi_redeem_tool_use(uuid,uuid,text,uuid) to service_role;
commit;
