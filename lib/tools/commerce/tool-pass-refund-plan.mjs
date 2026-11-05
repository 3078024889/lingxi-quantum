/**
 * Read-only refund reconciliation, not an executable refund / provider payout.
 * Inputs MUST come from server-side DB rows, never browser request JSON.
 * Exact source+refundable split is preserved by purchase_tool_pass_v2.
 */
const VALID_CURRENCY=new Set(["CNY","USD"]);
const POS_INT=n=>Number.isSafeInteger(n)&&n>=0;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function planUnusedToolPassWalletReversal({order,operations,now=Date.now()}={}){
 const deny=error=>Object.freeze({ok:false,error});
 if(!order||typeof order!=="object"||!UUID.test(order.request_id??"")||!UUID.test(order.user_id??""))
  return deny("INVALID_SOURCE_ORDER");
 if(order.state!=="active"||!VALID_CURRENCY.has(order.currency))return deny("NOT_AN_ACTIVE_WALLET_PURCHASE");
 if(!POS_INT(order.amount_minor)||order.amount_minor===0||!POS_INT(order.active_source_minor)||!POS_INT(order.legacy_source_minor)
  ||order.active_source_minor+order.legacy_source_minor!==order.amount_minor)return deny("BALANCE_SOURCE_MISMATCH");
 if(!POS_INT(order.active_refundable_source_minor)||!POS_INT(order.legacy_refundable_source_minor)
  ||order.active_refundable_source_minor>order.active_source_minor
  ||order.legacy_refundable_source_minor>order.legacy_source_minor)return deny("REFUNDABLE_PRINCIPAL_MISMATCH");
 const starts=Date.parse(order.starts_at??""),ends=Date.parse(order.ends_at??"");
 if(!Number.isFinite(starts)||!Number.isFinite(ends)||ends<=starts||!Number.isFinite(now))
  return deny("INVALID_TERM");
 // Fail closed if a real usage ledger has not been supplied. Refunds of used
 // periods need a separate documented partial-refund policy and review.
 if(!Array.isArray(operations))return deny("UNVERIFIED_USAGE");
 for(const operation of operations){
  if(!operation||typeof operation!=="object"||typeof operation.user_id!=="string"
   ||typeof operation.claimed_at!=="string"||typeof operation.access_kind!=="string")
   return deny("UNVERIFIED_USAGE");
  if(operation.user_id!==order.user_id)continue;
  const claimed=Date.parse(operation.claimed_at);
  if(!Number.isFinite(claimed))return deny("UNVERIFIED_USAGE");
  if(operation.access_kind==="pass"){
   // An account may have consecutive or replacement passes. Only the exact
   // purchase referenced by the immutable processing receipt is relevant.
   if(typeof operation.pass_order_id!=="string"||!UUID.test(operation.pass_order_id))
    return deny("UNVERIFIED_USAGE");
   if(operation.pass_order_id===order.request_id)return deny("PASS_ALREADY_USED");
  }
 }
 if(order.refund_confirmed_at||order.refund_reference_id)return deny("REFUND_ALREADY_RECORDED");
 return Object.freeze({
  ok:true,
  kind:"WALLET_REVERSAL_PLAN_ONLY",
  requestId:order.request_id,
  userId:order.user_id,
  currency:order.currency,
  totalMinor:order.amount_minor,
  credits:Object.freeze([
   {wallet:"sasi",amountMinor:order.active_source_minor,refundableMinor:order.active_refundable_source_minor},
   {wallet:"legacy_ai",amountMinor:order.legacy_source_minor,refundableMinor:order.legacy_refundable_source_minor}
  ]),
  requires:"atomic service-role database refund with durable idempotent ledger entries"
 });
}
