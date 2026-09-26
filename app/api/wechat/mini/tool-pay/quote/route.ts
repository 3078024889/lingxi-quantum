import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireMiniSession} from "@/lib/mini/session";
export const runtime="nodejs";
export async function GET(req:Request){
 const session=await requireMiniSession(req);if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});
 const id=new URL(req.url).searchParams.get("quoteId")||"";
 const admin=createAdminClient();
 const{data:q}=await admin.from("tool_payment_quotes").select("id,tool_id,quantity,unit_name,amount_rmb,amount_usd,currency,status,expires_at").eq("id",id).eq("user_id",session.userId).maybeSingle();
 if(!q)return NextResponse.json({error:"这次价格已经失效，请回到工具重新确认。"},{status:404});
 return NextResponse.json(q,{headers:{"Cache-Control":"private, no-store"}});
}
