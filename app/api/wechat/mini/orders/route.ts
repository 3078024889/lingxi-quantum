import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireMiniSession} from "@/lib/mini/session";
export const runtime="nodejs";
export async function GET(req:Request){
 const session=await requireMiniSession(req);if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});
 const admin=createAdminClient();
 const{data,error}=await admin.from("orders").select("id,product_id,amount_rmb,amount_usd,currency,status,provider,channel,created_at,paid_at").eq("user_id",session.userId).order("created_at",{ascending:false}).limit(100);
 if(error)return NextResponse.json({error:"订单暂时没有加载出来"},{status:500});
 return NextResponse.json({orders:data||[]},{headers:{"Cache-Control":"private, no-store"}});
}
