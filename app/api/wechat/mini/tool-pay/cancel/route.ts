import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireMiniSession} from "@/lib/mini/session";
export async function POST(req:Request){
 const session=await requireMiniSession(req);if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});
 const body=await req.json().catch(()=>({}));const orderId=String(body.orderId||""),quoteId=String(body.quoteId||"");
 const admin=createAdminClient();
 const{data:o}=await admin.from("orders").select("id,status,product_id").eq("id",orderId).eq("user_id",session.userId).maybeSingle();
 if(o?.status==="pending"&&o.product_id===`toolquote:${quoteId}`){
  await admin.from("orders").update({status:"canceled"}).eq("id",o.id).eq("status","pending");
  await admin.from("tool_payment_quotes").update({status:"quoted"}).eq("id",quoteId).eq("user_id",session.userId).eq("status","ordered");
 }
 return NextResponse.json({ok:true});
}
