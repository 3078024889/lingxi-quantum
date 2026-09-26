import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPaypalOrder } from "@/lib/paypal";
import { alipayEnabled, alipaySiteUrl, createAlipayPaymentUrl } from "@/lib/alipay";
import { createWechatNativeOrder,createWechatJsapiOrder,buildJsapiInvokeParams,wechatPayConfigured } from "@/lib/wechatpay";
import { exchangeCodeForOpenid,wechatOauthConfigured } from "@/lib/wechat-oauth";

import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { toolRuntimeState } from "@/lib/tools/service-readiness";
import { parseCurrency, providerAllowedForCurrency } from "@/lib/payments/currency-book";
export const runtime="nodejs"; export const maxDuration=30;

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  try{
    const contentLength=Number(req.headers.get("content-length")||0);
    if(Number.isFinite(contentLength)&&contentLength>64*1024)return NextResponse.json({error:"PAYMENT_REQUEST_TOO_LARGE"},{status:413});

    const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:"请先登录"},{status:401});

    const body=await req.json().catch(()=>({}));
    const quoteId=String(body.quoteId||"").trim();
    const provider=String(body.provider||"").trim();
    const code=typeof body.code==="string"?body.code:undefined;
    const state=typeof body.state==="string"?body.state:undefined;
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quoteId))
      return NextResponse.json({error:"INVALID_QUOTE_ID"},{status:400});
    if(!["wechat","alipay","paypal"].includes(provider))
      return NextResponse.json({error:"支付方式无效"},{status:400});

    const admin=createAdminClient();
    const limited=await admin.rpc("rate_limit_check",{p_key:`tool-pay-create:${user.id}`,p_limit:120,p_window_seconds:3600});
    if(limited.error)return NextResponse.json({error:"PAYMENT_RATE_GUARD_UNAVAILABLE"},{status:503});
    if(limited.data!==true)return NextResponse.json({error:"PAYMENT_RATE_LIMITED"},{status:429});
    const abuse=await enforceAbuseGuard(req,{scope:"tool-payment-create",userId:user.id,accountLimit:60,ipLimit:180});
    if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
    const {data:q}=await admin.from("tool_payment_quotes").select("*").eq("id",quoteId).eq("user_id",user.id).single();
    if(!q)return NextResponse.json({error:"报价不存在"},{status:404});
    if(q.status==="paid")return NextResponse.json({paid:true});
    const runtimeState=toolRuntimeState(String(q.tool_id||""));
    if(!runtimeState.ready){
      return NextResponse.json({error:"TOOL_RUNTIME_UNAVAILABLE",toolId:q.tool_id},{status:503});
    }
    if(new Date(q.expires_at).getTime()<Date.now())return NextResponse.json({error:"报价已过期，请重新计算"},{status:410});

    const p=provider;
    const quoteCurrency=parseCurrency(q.currency)||parseCurrency(q.metadata?.pricing_currency);
    if(!quoteCurrency)return NextResponse.json({error:"QUOTE_CURRENCY_MISSING"},{status:409});
    if(!providerAllowedForCurrency(p,quoteCurrency)){
      return NextResponse.json({error:"PAYMENT_METHOD_NOT_AVAILABLE_FOR_REGION"},{status:403});
    }

    // Provider readiness must be checked BEFORE creating a local order.
    // Otherwise a disabled provider can leave ghost pending orders behind.
    if(p==="paypal"){
      const paypalReady =
        process.env.PAYPAL_ENABLED?.trim().toLowerCase()==="true" &&
        Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim() && process.env.PAYPAL_WEBHOOK_ID?.trim());
      if(!paypalReady)return NextResponse.json({error:"PayPal 暂未开放"},{status:503});
    }
    if(p==="alipay"&&!alipayEnabled())return NextResponse.json({error:"支付宝当前不可用"},{status:503});
    if(p==="wechat"&&!wechatPayConfigured())return NextResponse.json({error:"微信支付当前不可用"},{status:503});

    const {data:order,error}=await admin.from("orders").insert({
      user_id:user.id, product_id:`toolquote:${q.id}`, product_type:"permanent",
      amount_usd:q.amount_usd, amount_rmb:q.amount_rmb, status:"pending", provider:p,
      submission_name:`工具：${q.tool_id} · ${q.quantity} ${q.unit_name}`
    }).select().single();
    if(error||!order)return NextResponse.json({error:"创建订单失败"},{status:500});
    await admin.from("tool_payment_quotes").update({status:"ordered"}).eq("id",q.id);
    const base=process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com";

    if(p==="paypal"){
      const out=await createPaypalOrder({
        amountUsd:Number(q.amount_usd),
        description:`Lingxifield Tool · ${q.tool_id}`,
        referenceId:order.id,
        returnUrl:`${base}/api/pay/paypal/return?orderId=${order.id}&dest=${encodeURIComponent(`/tools/pay?quoteId=${q.id}&paid=1`)}`,
        cancelUrl:`${base}/tools/pay?quoteId=${q.id}&canceled=1`,
      });
      await admin.from("orders").update({provider_payment_id:out.id}).eq("id",order.id);
      return NextResponse.json({orderId:order.id,url:out.approveUrl});
    }

    if(p==="alipay"){
      const outTradeNo=`LX${order.id.replace(/-/g,"")}`.slice(0,64);
      const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(req.headers.get("user-agent")||"");
      const paymentUrl=createAlipayPaymentUrl({
        outTradeNo, amountRmb:Number(q.amount_rmb), subject:`灵犀场工具-${String(q.tool_id).slice(0,40)}`,
        notifyUrl:`${alipaySiteUrl()}/api/pay/alipay/notify`,
        returnUrl:`${alipaySiteUrl()}/api/pay/alipay/return?orderId=${order.id}&dest=${encodeURIComponent(`/tools/pay?quoteId=${q.id}&paid=1`)}`,
        mobile
      });
      await admin.from("orders").update({provider_payment_id:outTradeNo}).eq("id",order.id);
      return NextResponse.json({orderId:order.id,url:paymentUrl});
    }

    const useJsapi=typeof code==="string"&&code.length>0;
    if(useJsapi){
      const expected=cookies().get("lingxi_wechat_oauth_state")?.value;
      if(!expected||state!==expected)return NextResponse.json({error:"微信授权状态已失效"},{status:400});
      cookies().delete("lingxi_wechat_oauth_state");
      if(!wechatOauthConfigured())return NextResponse.json({error:"微信网页授权不可用"},{status:503});
      const {openid}=await exchangeCodeForOpenid(code);
      const outTradeNo=`LX${order.id.replace(/-/g,"")}`.slice(0,32);
      const {prepayId}=await createWechatJsapiOrder({
        outTradeNo,description:`Lingxi Field - ${String(q.tool_id).slice(0,36)}`,
        amountFen:Math.round(Number(q.amount_rmb)*100),notifyUrl:`${base}/api/pay/wechat/notify`,openid
      });
      await admin.from("orders").update({provider_payment_id:outTradeNo}).eq("id",order.id);
      return NextResponse.json({orderId:order.id,jsapi:buildJsapiInvokeParams(prepayId)});
    }else{
      const outTradeNo=`LX${order.id.replace(/-/g,"")}`.slice(0,32);
      const {codeUrl}=await createWechatNativeOrder({
        outTradeNo,description:`Lingxi Field - ${String(q.tool_id).slice(0,36)}`,
        amountFen:Math.round(Number(q.amount_rmb)*100),notifyUrl:`${base}/api/pay/wechat/notify`
      });
      await admin.from("orders").update({provider_payment_id:outTradeNo}).eq("id",order.id);
      return NextResponse.json({orderId:order.id,codeUrl});
    }
  }catch(e){
    console.error("[tools pay create]",e);
    return NextResponse.json({error:"支付初始化失败"},{status:500});
  }
}
