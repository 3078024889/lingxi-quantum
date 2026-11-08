import {NextRequest,NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {createAdminClient} from "@/lib/supabase/admin";
export const dynamic="force-dynamic";export const runtime="nodejs";
export async function POST(req:NextRequest){
 const expected=process.env.SASI_MARKET_CRON_SECRET||"";
 const authorization=req.headers.get("authorization")||"";
 const provided=authorization.startsWith("Bearer ")?authorization.slice(7):"";
 if(!expected||!provided||Buffer.byteLength(expected)!==Buffer.byteLength(provided)||
 !timingSafeEqual(Buffer.from(expected),Buffer.from(provided)))
 return NextResponse.json({error:"FORBIDDEN"},{status:403,headers:{"Cache-Control":"no-store"}});
 if(process.env.SASI_MARKET_SALES_ENABLED!=="true")
 return NextResponse.json({error:"MARKET_NOT_OPEN"},{status:503});
 try{
  const {data,error}=await createAdminClient().rpc("sasi_market_release_due_sales");
  if(error)throw Error("RELEASE_FAILED");
  return NextResponse.json({released:Number(data)||0,providerPaid:false},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"RELEASE_NOT_READY"},{status:503});}
}
