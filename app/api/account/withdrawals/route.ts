import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {dispatchWithdrawal} from "@/lib/payments/withdrawal-processing";
import {moneyMinor,walletKind} from "@/lib/payments/money-input";
import {randomUUID} from "node:crypto";

export const runtime="nodejs";
export const maxDuration=90;

function isBalanceProduct(id:string){
  return id.startsWith("ai-balance-")
    ||id.startsWith("sasi-balance-")
    ||id.startsWith("sasi-credit-")
    ||id.startsWith("ai-usd-balance-")
    ||id.startsWith("sasi-usd-balance-");
}
function walletCurrency(productId:string){
  return productId.includes("-usd-balance-")?"USD":"CNY";
}

export async function GET(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});

  const admin=createAdminClient();
  const [ordersResult,withdrawalsResult,legacyResult,ai,sasi,aiUsd,sasiUsd]=await Promise.all([
    admin.from("orders")
      .select("id,product_id,provider,amount_rmb,amount_usd,status,created_at")
      .eq("user_id",user.id).eq("status","paid")
      .order("created_at",{ascending:false}).limit(100),
    admin.from("balance_withdrawals")
      .select("id,order_id,wallet_kind,provider,currency,provider_currency,amount_minor,provider_amount_minor,status,provider_status,failure_code,created_at,completed_at,updated_at,provider_refund_id,legacy_refund_id")
      .eq("user_id",user.id).order("created_at",{ascending:false}).limit(100),
    admin.from("ai_refund_requests").select("id,order_id,amount_fen,status,created_at,updated_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100),
    admin.from("ai_wallets").select("available_fen,refundable_fen,refund_hold_fen").eq("user_id",user.id).maybeSingle(),
    admin.from("sasi_wallets").select("available_points,refundable_points,refund_hold_points").eq("user_id",user.id).maybeSingle(),
    admin.from("ai_usd_wallets").select("available_cents,refundable_cents,refund_hold_cents").eq("user_id",user.id).maybeSingle(),
    admin.from("sasi_usd_wallets").select("available_cents,refundable_cents,refund_hold_cents").eq("user_id",user.id).maybeSingle(),
  ]);
  if(ordersResult.error||withdrawalsResult.error||legacyResult.error||ai.error||sasi.error||aiUsd.error||sasiUsd.error)return NextResponse.json({error:"WITHDRAWAL_DATA_FAILED"},{status:500});
  const cap=(a:unknown,p:unknown,h:unknown)=>Math.max(0,Math.min(Number(a||0),Number(p||0)-Number(h||0)));
  const caps={ai_cny:cap(ai.data?.available_fen,ai.data?.refundable_fen,ai.data?.refund_hold_fen),sasi_cny:cap(sasi.data?.available_points,sasi.data?.refundable_points,sasi.data?.refund_hold_points),ai_usd:cap(aiUsd.data?.available_cents,aiUsd.data?.refundable_cents,aiUsd.data?.refund_hold_cents),sasi_usd:cap(sasiUsd.data?.available_cents,sasiUsd.data?.refundable_cents,sasiUsd.data?.refund_hold_cents)};
  return NextResponse.json({
    orders:(ordersResult.data||[]).filter(o=>isBalanceProduct(String(o.product_id||""))).map(o=>{const kind=walletKind(o.product_id);const principal=Math.round(Number(kind.endsWith("usd")?o.amount_usd:o.amount_rmb)*100);const used=(withdrawalsResult.data||[]).filter(w=>w.order_id===o.id&&["requested","processing","completed"].includes(w.status)).reduce((a,w)=>a+Number(w.amount_minor),0)+(legacyResult.data||[]).filter(w=>w.order_id===o.id&&["requested","approved","completed"].includes(w.status)).reduce((a,w)=>a+Number(w.amount_fen),0);return {...o,refundable_minor:Math.max(0,Math.min(caps[kind],principal-used)),currency:kind.endsWith("usd")?"USD":"CNY"}}),
    withdrawals:withdrawalsResult.data||[],
    legacyRefunds:legacyResult.data||[],
  },{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});

  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});

  const body=await req.json().catch(()=>null) as {orderId?:unknown;amount?:unknown;note?:unknown;requestId?:unknown}|null;
  const orderId=String(body?.orderId||"").trim();
  const amountMinor=moneyMinor(body?.amount);
  const requestId=typeof body?.requestId==="string"?body.requestId:randomUUID();
  if(!/^[0-9a-f-]{36}$/i.test(orderId)||amountMinor===null||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)){
    return NextResponse.json({error:"INVALID_WITHDRAWAL_REQUEST"},{status:400});
  }

  const admin=createAdminClient();
  const rate=await admin.rpc("rate_limit_check",{p_key:`balance-withdrawal:${user.id}`,p_limit:20,p_window_seconds:3600});
  if(rate.error)return NextResponse.json({error:"RATE_GUARD_UNAVAILABLE"},{status:503});
  if(rate.data!==true)return NextResponse.json({error:"RATE_LIMITED"},{status:429});

  const replay=await admin.from('balance_withdrawals').select('id,order_id,amount_minor').eq('user_id',user.id).eq('client_request_id',requestId).maybeSingle();
  if(replay.error)return NextResponse.json({error:'WITHDRAWAL_DATA_FAILED'},{status:503});
  if(replay.data){
    if(replay.data.order_id!==orderId||Number(replay.data.amount_minor)!==amountMinor)return NextResponse.json({error:'REQUEST_CONFLICT'},{status:409});
    return NextResponse.json(await dispatchWithdrawal(replay.data.id,user.id));
  }
  const {data:order,error:orderError}=await admin.from("orders")
    .select("id,user_id,product_id,provider,provider_payment_id,amount_rmb,amount_usd,status")
    .eq("id",orderId).eq("user_id",user.id).single();
  if(orderError||!order||order.status!=="paid"||!isBalanceProduct(String(order.product_id||""))){
    return NextResponse.json({error:"ORDER_NOT_REFUNDABLE"},{status:409});
  }

  const balanceCurrency=walletCurrency(String(order.product_id));
  const walletOrderTotal=balanceCurrency==="USD"
    ?Math.round(Number(order.amount_usd||0)*100)
    :Math.round(Number(order.amount_rmb||0)*100);
  if(amountMinor<=0||amountMinor>walletOrderTotal){
    return NextResponse.json({error:"INVALID_WITHDRAWAL_AMOUNT"},{status:400});
  }

  const requested=await admin.rpc("request_balance_withdrawal_v2",{
    p_request_id:requestId,
    p_user_id:user.id,p_order_id:order.id,p_amount_minor:amountMinor,
    p_note:typeof body?.note==="string"?body.note.slice(0,500):null,
  });
  const d=requested.data as {
    ok?:boolean;error?:string;withdrawalId?:string;
    providerCurrency?:string;providerAmountMinor?:number;
  }|null;
  if(requested.error||!d?.ok||!d.withdrawalId||!d.providerCurrency||!d.providerAmountMinor){
    return NextResponse.json({error:d?.error||"WITHDRAWAL_REQUEST_FAILED"},{status:409});
  }

  const result=await dispatchWithdrawal(d.withdrawalId,user.id);
  return NextResponse.json(result,{status:result.ok?(result.status==='completed'?200:202):409});
}
