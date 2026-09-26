import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireMiniSession} from "@/lib/mini/session";
import {exchangeMiniCode} from "@/lib/mini/wechat";
import {getProduct} from "@/lib/plans";
import {createMiniJsapiOrder,buildMiniRequestPayment,miniJsapiPayConfigured} from "@/lib/mini/tool-pay";
import {checkRateLimit,getClientIp} from "@/lib/rate-limit";

export const runtime="nodejs";
export const maxDuration=30;

const ALLOWED=new Set(["ai-balance-10","ai-balance-30","ai-balance-50","ai-balance-100","ai-balance-300","ai-balance-500"]);

export async function POST(req:Request){
  const session=await requireMiniSession(req);
  if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});

  const ip=getClientIp(req);
  if(!(await checkRateLimit(`mini-balance-pay-ip:${ip}`,30,600)))return NextResponse.json({error:"操作过于频繁，请稍后再试"},{status:429});
  if(!(await checkRateLimit(`mini-balance-pay-user:${session.userId}`,12,600)))return NextResponse.json({error:"支付请求过于频繁，请稍后再试"},{status:429});
  if(!miniJsapiPayConfigured())return NextResponse.json({error:"小程序微信支付暂未完成配置"},{status:503});

  const body=await req.json().catch(()=>({}));
  const productId=String(body.productId||"");
  const code=String(body.code||"");
  if(!ALLOWED.has(productId)||!code)return NextResponse.json({error:"充值参数无效"},{status:400});

  const product=getProduct(productId);
  if(!product||product.group!=="ai"||product.priceRmb<=0)return NextResponse.json({error:"充值项目不可用"},{status:404});

  const wxSession=await exchangeMiniCode(code);
  if(wxSession.openid!==session.openid)return NextResponse.json({error:"微信身份与登录状态不一致"},{status:403});

  const admin=createAdminClient();
  const{data:order,error}=await admin.from("orders").insert({
    user_id:session.userId,
    product_id:product.id,
    product_type:product.type,
    amount_usd:product.priceUsd,
    amount_rmb:product.priceRmb,
    currency:"CNY",
    status:"pending",
    provider:"wechat",
    channel:"mini-program",
    submission_name:`小程序余额充值 ¥${product.priceRmb}`,
  }).select("id").single();

  if(error||!order)return NextResponse.json({error:"支付准备失败，请稍后重试"},{status:500});

  const outTradeNo=`LXM${order.id.replace(/-/g,"")}`.slice(0,32);
  try{
    const prepayId=await createMiniJsapiOrder({
      outTradeNo,
      description:`Lingxifield Balance ¥${product.priceRmb}`,
      amountFen:Math.round(product.priceRmb*100),
      notifyUrl:"https://lingxifield.cn/api/pay/wechat/notify",
      openid:session.openid,
    });
    await admin.from("orders").update({provider_payment_id:outTradeNo}).eq("id",order.id).eq("status","pending");
    return NextResponse.json({orderId:order.id,amountRmb:product.priceRmb,payment:buildMiniRequestPayment(prepayId)});
  }catch(e){
    console.error("[mini balance pay]",e instanceof Error?e.message:String(e));
    await admin.from("orders").update({status:"canceled"}).eq("id",order.id).eq("status","pending");
    return NextResponse.json({error:"微信支付没有准备成功，请稍后重试"},{status:502});
  }
}
