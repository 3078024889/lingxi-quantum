import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {executeProviderRefund} from "@/lib/payment-refunds";

export const runtime="nodejs";export const maxDuration=30;

export async function GET(){
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const admin=createAdminClient();
 const{data}=await admin.from("ai_refund_requests").select("id,order_id,amount_fen,status,created_at").eq("user_id",user.id).in("status",["requested","approved"]).order("created_at",{ascending:false});
 return NextResponse.json({items:data||[]},{headers:{"Cache-Control":"private, no-store"}});
}

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const requestId=String((await req.json().catch(()=>({})))?.requestId||"");
 const admin=createAdminClient();
 const{data:legacy}=await admin.from("ai_refund_requests").select("*").eq("id",requestId).eq("user_id",user.id).in("status",["requested","approved"]).maybeSingle();
 if(!legacy)return NextResponse.json({error:"旧申请不存在或已经处理"},{status:404});
 const{data:order}=await admin.from("orders").select("id,provider,provider_payment_id,amount_rmb,amount_usd,status").eq("id",legacy.order_id).eq("user_id",user.id).maybeSingle();
 if(!order||order.status!=="paid")return NextResponse.json({error:"原充值订单当前无法退款"},{status:409});

 // Release the legacy hold first. If the new request cannot be created, the money is simply returned to available balance.
 const released=await admin.rpc("resolve_ai_refund",{p_request_id:legacy.id,p_resolution:"rejected",p_provider_refund_id:null,p_note:"已迁移到统一自动原路退款流程"});
 if(released.error)return NextResponse.json({error:"旧申请迁移失败，请稍后重试"},{status:500});

 const requested=await admin.rpc("request_balance_withdrawal",{p_user_id:user.id,p_order_id:order.id,p_amount_minor:Number(legacy.amount_fen),p_note:"由旧退款申请迁移"});
 const d=requested.data as any;
 if(requested.error||!d?.ok||!d.withdrawalId){
  return NextResponse.json({error:"旧申请已解除冻结，请在“余额提现”重新提交。",released:true},{status:409});
 }
 const wid=String(d.withdrawalId);
 await admin.from("balance_withdrawals").update({status:"processing",processing_started_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",wid).eq("status","requested");
 if(!order.provider_payment_id)return NextResponse.json({ok:true,status:"processing",withdrawalId:wid},{status:202});
 try{
  const providerCurrency=String(d.providerCurrency);
  const total=providerCurrency==="USD"?Math.round(Number(order.amount_usd||0)*100):Math.round(Number(order.amount_rmb||0)*100);
  const attempt=await executeProviderRefund({provider:String(order.provider||""),providerPaymentId:String(order.provider_payment_id),localOrderId:order.id,withdrawalId:wid,currency:providerCurrency,orderAmountMinor:total,refundAmountMinor:Number(d.providerAmountMinor)});
  if(attempt.state==="completed"){
   await admin.rpc("complete_balance_withdrawal",{p_withdrawal_id:wid,p_provider_refund_id:attempt.refundId||"",p_provider_status:attempt.providerStatus});
   return NextResponse.json({ok:true,status:"completed",withdrawalId:wid});
  }
  if(attempt.state==="failed"){
   await admin.rpc("release_balance_withdrawal",{p_withdrawal_id:wid,p_failure_code:"PROVIDER_REFUND_REJECTED",p_provider_status:attempt.providerStatus});
   return NextResponse.json({error:"原支付渠道拒绝了退款，余额已释放。",withdrawalId:wid},{status:409});
  }
  await admin.from("balance_withdrawals").update({provider_refund_id:attempt.refundId,provider_status:attempt.providerStatus,updated_at:new Date().toISOString()}).eq("id",wid);
  return NextResponse.json({ok:true,status:"processing",withdrawalId:wid},{status:202});
 }catch(e){
  console.error("[legacy refund migrate]",wid,e instanceof Error?e.message:String(e));
  return NextResponse.json({ok:true,status:"processing",withdrawalId:wid},{status:202});
 }
}
