import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireMiniSession} from "@/lib/mini/session";

export const runtime="nodejs";
export async function GET(req:Request){
 const session=await requireMiniSession(req);
 if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});
 const orderId=new URL(req.url).searchParams.get("orderId")||"";
 const admin=createAdminClient();
 const{data:o}=await admin.from("orders").select("id,status,product_id,amount_rmb,provider,channel,paid_at").eq("id",orderId).eq("user_id",session.userId).maybeSingle();
 if(!o)return NextResponse.json({error:"订单不存在"},{status:404});
 return NextResponse.json({order:o},{headers:{"Cache-Control":"private, no-store"}});
}
