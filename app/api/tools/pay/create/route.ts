import {NextRequest,NextResponse} from "next/server";
import {cookies} from "next/headers";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {createPaypalOrder} from "@/lib/paypal";
import {alipayEnabled,alipaySiteUrl,createAlipayPaymentUrl} from "@/lib/alipay";
import {createWechatNativeOrder,createWechatJsapiOrder,buildJsapiInvokeParams,wechatPayConfigured} from "@/lib/wechatpay";
import {exchangeCodeForOpenid,wechatOauthConfigured} from "@/lib/wechat-oauth";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {toolRuntimeState} from "@/lib/tools/service-readiness";
import {parseCurrency,providerAllowedForCurrency} from "@/lib/payments/currency-book";

export const runtime="nodejs";export const maxDuration=30;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const baseFor=(currency:"CNY"|"USD")=>currency==="CNY"?(process.env.NEXT_PUBLIC_CN_SITE_URL||"https://lingxifield.cn"):(process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com");

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 let admin:any=null,quote:any=null,order:any=null;
 try{
  const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});
  const body=await req.json().catch(()=>({}));const quoteId=String(body.quoteId||""),p=String(body.provider||""),code=typeof body.code==="string"?body.code:undefined,state=typeof body.state==="string"?body.state:undefined;
  if(!UUID.test(quoteId))return NextResponse.json({error:"INVALID_QUOTE_ID"},{status:400});
  if(!["wechat","alipay","paypal"].includes(p))return NextResponse.json({error:"支付方式无效"},{status:400});
  admin=createAdminClient();
  const limited=await admin.rpc("rate_limit_check",{p_key:`tool-pay-create:${user.id}`,p_limit:120,p_window_seconds:3600});
  if(limited.error)return NextResponse.json({error:"PAYMENT_RATE_GUARD_UNAVAILABLE"},{status:503});
  if(limited.data!==true)return NextResponse.json({error:"PAYMENT_RATE_LIMITED"},{status:429});
  const abuse=await enforceAbuseGuard(req,{scope:"tool-payment-create",userId:user.id,accountLimit:60,ipLimit:180});if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
  const qr=await admin.from("tool_payment_quotes").select("*").eq("id",quoteId).eq("user_id",user.id).maybeSingle();quote=qr.data;
  if(!quote)return NextResponse.json({error:"报价不存在"},{status:404});
  if(quote.status==="paid")return NextResponse.json({paid:true});
  if(new Date(quote.expires_at).getTime()<Date.now())return NextResponse.json({error:"报价已过期，请重新计算"},{status:410});
  if(!toolRuntimeState(String(quote.tool_id||"")).ready)return NextResponse.json({error:"TOOL_RUNTIME_UNAVAILABLE"},{status:503});
  const currency=parseCurrency(quote.currency)||parseCurrency(quote.metadata?.pricing_currency);
  if(!currency)return NextResponse.json({error:"QUOTE_CURRENCY_MISSING"},{status:409});
  if(!providerAllowedForCurrency(p,currency))return NextResponse.json({error:"PAYMENT_METHOD_NOT_AVAILABLE_FOR_REGION"},{status:403});

  // Complete every provider/OAuth precondition before creating a local order.
  const useJsapi=p==="wechat"&&Boolean(code);
  if(p==="paypal"){
   const ready=process.env.PAYPAL_ENABLED?.trim().toLowerCase()==="true"&&Boolean(process.env.PAYPAL_CLIENT_ID?.trim()&&process.env.PAYPAL_CLIENT_SECRET?.trim()&&process.env.PAYPAL_WEBHOOK_ID?.trim());
   if(!ready)return NextResponse.json({error:"PayPal 暂未开放"},{status:503});
  }
  if(p==="alipay"&&!alipayEnabled())return NextResponse.json({error:"支付宝当前不可用"},{status:503});
  if(p==="wechat"&&!wechatPayConfigured())return NextResponse.json({error:"微信支付当前不可用"},{status:503});
  if(useJsapi){
   const expected=cookies().get("lingxi_wechat_oauth_state")?.value;
   if(!expected||state!==expected)return NextResponse.json({error:"微信授权状态已失效，请重新打开支付页。",code:"WECHAT_OAUTH_STATE_EXPIRED"},{status:400});
   if(!wechatOauthConfigured())return NextResponse.json({error:"微信网页授权不可用"},{status:503});
  }

  // Atomic quote claim: only one payment initializer can own a quote at a time.
  const claim=await admin.from("tool_payment_quotes").update({status:"ordered"}).eq("id",quote.id).eq("status","quoted").select("id").maybeSingle();
  if(!claim.data){
   const{data:existing}=await admin.from("orders").select("id,status,provider,provider_payment_id").eq("user_id",user.id).eq("product_id",`toolquote:${quote.id}`).in("status",["pending","paid"]).order("created_at",{ascending:false}).limit(1).maybeSingle();
   if(existing?.status==="paid")return NextResponse.json({paid:true});
   return NextResponse.json({error:"这次支付已经开始，请等待订单状态更新；如已取消，请重新确认价格。",code:"PAYMENT_ALREADY_STARTED",orderId:existing?.id||null},{status:409});
  }

  const inserted=await admin.from("orders").insert({user_id:user.id,product_id:`toolquote:${quote.id}`,product_type:"permanent",amount_usd:quote.amount_usd,amount_rmb:quote.amount_rmb,currency,status:"pending",provider:p,submission_name:`工具：${quote.tool_id} · ${quote.quantity} ${quote.unit_name}`}).select().single();
  order=inserted.data;
  if(inserted.error||!order){await admin.from("tool_payment_quotes").update({status:"quoted"}).eq("id",quote.id).eq("status","ordered");return NextResponse.json({error:"创建订单失败"},{status:500});}

  const base=baseFor(currency);
  if(p==="paypal"){
   const out=await createPaypalOrder({amountUsd:Number(quote.amount_usd),description:`Lingxifield Tool · ${quote.tool_id}`,referenceId:order.id,returnUrl:`${base}/api/pay/paypal/return?orderId=${order.id}&dest=${encodeURIComponent(`/tools/pay?quoteId=${quote.id}&paid=1`)}`,cancelUrl:`${base}/tools/pay?quoteId=${quote.id}&canceled=1`});
   await admin.from("orders").update({provider_payment_id:out.id}).eq("id",order.id);return NextResponse.json({orderId:order.id,url:out.approveUrl});
  }
  if(p==="alipay"){
   const outTradeNo=`LX${order.id.replace(/-/g,"")}`.slice(0,64),mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(req.headers.get("user-agent")||"");
   const paymentUrl=createAlipayPaymentUrl({outTradeNo,amountRmb:Number(quote.amount_rmb),subject:`灵犀场工具-${String(quote.tool_id).slice(0,40)}`,notifyUrl:`${alipaySiteUrl()}/api/pay/alipay/notify`,returnUrl:`${alipaySiteUrl()}/api/pay/alipay/return?orderId=${order.id}&dest=${encodeURIComponent(`/tools/pay?quoteId=${quote.id}&paid=1`)}`,mobile});
   await admin.from("orders").update({provider_payment_id:outTradeNo}).eq("id",order.id);return NextResponse.json({orderId:order.id,url:paymentUrl});
  }
  if(useJsapi){
   const{openid}=await exchangeCodeForOpenid(code!);cookies().delete("lingxi_wechat_oauth_state");
   const outTradeNo=`LX${order.id.replace(/-/g,"")}`.slice(0,32),{prepayId}=await createWechatJsapiOrder({outTradeNo,description:`Lingxi Field - ${String(quote.tool_id).slice(0,36)}`,amountFen:Math.round(Number(quote.amount_rmb)*100),notifyUrl:`${base}/api/pay/wechat/notify`,openid});
   await admin.from("orders").update({provider_payment_id:outTradeNo}).eq("id",order.id);return NextResponse.json({orderId:order.id,jsapi:buildJsapiInvokeParams(prepayId)});
  }
  const outTradeNo=`LX${order.id.replace(/-/g,"")}`.slice(0,32),{codeUrl}=await createWechatNativeOrder({outTradeNo,description:`Lingxi Field - ${String(quote.tool_id).slice(0,36)}`,amountFen:Math.round(Number(quote.amount_rmb)*100),notifyUrl:`${base}/api/pay/wechat/notify`});
  await admin.from("orders").update({provider_payment_id:outTradeNo}).eq("id",order.id);return NextResponse.json({orderId:order.id,codeUrl});
 }catch(e){
  console.error("[tools pay create]",e);
  if(admin&&order?.id)await admin.from("orders").update({status:"canceled"}).eq("id",order.id).eq("status","pending");
  if(admin&&quote?.id)await admin.from("tool_payment_quotes").update({status:"quoted"}).eq("id",quote.id).eq("status","ordered");
  return NextResponse.json({error:"支付初始化失败，请重试"},{status:500});
 }
}
