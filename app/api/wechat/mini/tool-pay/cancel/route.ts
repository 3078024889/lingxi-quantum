import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireMiniSession} from "@/lib/mini/session";
export async function POST(req:Request){
 const session=await requireMiniSession(req);if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});
 const body=await req.json().catch(()=>({}));const orderId=String(body.orderId||""),quoteId=String(body.quoteId||"");
 const admin=createAdminClient();
 const{data:o}=await admin.from("orders").select("id,status,product_id,provider").eq("id",orderId).eq("user_id",session.userId).maybeSingle();
 // Local cancellation cannot prove a virtual payment failed; its success callback may be lost.
 if(o?.provider==="wechat_mini_virtual")return NextResponse.json({error:"请先确认付款结果，不要重复付款。"},{status:409});
 if(o?.status==="pending"&&o.product_id===`toolquote:${quoteId}`){
  await admin.from("orders").update({status:"canceled"}).eq("id",o.id).eq("status","pending");
  await admin.from("tool_payment_quotes").update({status:"quoted"}).eq("id",quoteId).eq("user_id",session.userId).eq("status","ordered");
 }
 return NextResponse.json({ok:true});
}
