import {NextResponse} from "next/server";
import offers from "@/config/tool-pass-offers.v2.json";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"private, no-store, max-age=0"};
export async function GET(){
 if(process.env.LINGXIFIELD_TOOL_PASS_ENABLED!=="true"||!offers.active)
  return NextResponse.json({error:"TOOL_PASS_NOT_LIVE"},{status:503,headers:HEADERS});
 const {data:{user},error:authError}=await createClient().auth.getUser();
 if(authError||!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:HEADERS});
 const {data,error}=await createAdminClient().from("tool_pass_orders_v2")
  .select("request_id,sku,currency,starts_at,ends_at,state,created_at")
  .eq("user_id",user.id)
  .order("created_at",{ascending:false})
  .limit(30);
 if(error)return NextResponse.json({error:"PASS_STATUS_UNAVAILABLE"},{status:503,headers:HEADERS});
 const now=Date.now();
 const orders=(data||[]).map(o=>({
  id:o.request_id,sku:o.sku,currency:o.currency,
  startsAt:o.starts_at,endsAt:o.ends_at,state:o.state,
  currentlyUsable:o.state==="active"&&Date.parse(o.starts_at)<=now&&Date.parse(o.ends_at)>now
 }));
 return NextResponse.json({orders,active:orders.some(o=>o.currentlyUsable)},{headers:HEADERS});
}
