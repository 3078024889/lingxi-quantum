import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireMiniSession} from "@/lib/mini/session";
import {toolRuntimeState} from "@/lib/tools/service-readiness";
import {createMiniJsapiOrder,buildMiniRequestPayment,miniJsapiPayConfigured} from "@/lib/mini/tool-pay";

export const runtime="nodejs";export const maxDuration=30;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req:Request){
 const session=await requireMiniSession(req);if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});
 const body=await req.json().catch(()=>({}));const quoteId=String(body.quoteId||"");
 if(!UUID.test(quoteId))return NextResponse.json({error:"价格信息无效"},{status:400});
 if(!miniJsapiPayConfigured())return NextResponse.json({error:"小程序微信支付暂未完成配置"},{status:503});
 const admin=createAdminClient();
 const{data:q}=await admin.from("tool_payment_quotes").select("*").eq("id",quoteId).eq("user_id",session.userId).maybeSingle();
 if(!q)return NextResponse.json({error:"这次价格已经失效，请重新确认。"},{status:404});
 if(q.status==="paid")return NextResponse.json({paid:true});
 if(q.currency!=="CNY")return NextResponse.json({error:"小程序内使用人民币结算；美元支付请在浏览器打开 lingxifield.com。"},{status:409});
 if(new Date(q.expires_at).getTime()<Date.now())return NextResponse.json({error:"这次价格已经过期，请重新确认。"},{status:410});
 if(!toolRuntimeState(String(q.tool_id||"")).ready)return NextResponse.json({error:"这项服务暂时无法处理，不会产生费用。"},{status:503});

 const claimed=await admin.from("tool_payment_quotes").update({status:"ordered"}).eq("id",q.id).eq("status","quoted").select("id").maybeSingle();
 if(!claimed.data){
  const{data:existing}=await admin.from("orders").select("id,status").eq("product_id",`toolquote:${q.id}`).eq("user_id",session.userId).in("status",["pending","paid"]).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(existing?.status==="paid")return NextResponse.json({paid:true});
  return NextResponse.json({error:"这次支付已经开始，请返回工具等待支付结果；如果已取消，请重新确认价格。",code:"PAYMENT_ALREADY_STARTED"},{status:409});
 }

 const{data:order,error}=await admin.from("orders").insert({user_id:session.userId,product_id:`toolquote:${q.id}`,product_type:"permanent",amount_usd:q.amount_usd,amount_rmb:q.amount_rmb,currency:"CNY",status:"pending",provider:"wechat",channel:"mini-program",submission_name:`工具：${q.tool_id} · ${q.quantity} ${q.unit_name}`}).select().single();
 if(error||!order){await admin.from("tool_payment_quotes").update({status:"quoted"}).eq("id",q.id).eq("status","ordered");return NextResponse.json({error:"支付准备失败，请重试"},{status:500});}
 const outTradeNo=`LXM${order.id.replace(/-/g,"")}`.slice(0,32);
 try{
  const prepayId=await createMiniJsapiOrder({outTradeNo,description:`Lingxifield - ${String(q.tool_id).slice(0,40)}`,amountFen:Math.round(Number(q.amount_rmb)*100),notifyUrl:`https://lingxifield.cn/api/pay/wechat/notify`,openid:session.openid});
  await admin.from("orders").update({provider_payment_id:outTradeNo}).eq("id",order.id);
  return NextResponse.json({orderId:order.id,quoteId:q.id,payment:buildMiniRequestPayment(prepayId)});
 }catch(e){
  console.error("[mini tool pay]",e instanceof Error?e.message:String(e));
  await admin.from("orders").update({status:"canceled"}).eq("id",order.id).eq("status","pending");
  await admin.from("tool_payment_quotes").update({status:"quoted"}).eq("id",q.id).eq("status","ordered");
  return NextResponse.json({error:"微信支付没有准备成功，请稍后重试"},{status:502});
 }
}
