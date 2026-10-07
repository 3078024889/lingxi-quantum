import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {publicVisitPath} from "@/lib/analytics/public-visit";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const host=req.nextUrl.hostname;
 if(!["lingxifield.com","lingxifield.cn"].includes(host)||!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403});
 if(req.headers.get("dnt")==="1"||req.headers.get("sec-gpc")==="1")return new NextResponse(null,{status:204});
 if(/bot|crawler|spider|headless/i.test(req.headers.get("user-agent")||""))return new NextResponse(null,{status:204});
 try{
  const b=await boundedRequestJson(req,2048) as Record<string,unknown>,path=publicVisitPath(b.path);
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if(!path||typeof b.id!=="string"||!uuid.test(b.id)||typeof b.session!=="string"||!uuid.test(b.session)||!["mobile","desktop"].includes(String(b.device)))return NextResponse.json({error:"INVALID_VISIT"},{status:400});
  const guard=await enforceAbuseGuard(req,{scope:"public-visit",ipLimit:600,windowSeconds:3600});
  if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status});
  const day=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai"}).format(new Date());
  const session_hash=createHash("sha256").update(day+":"+host+":"+b.session).digest("hex");
  const referrer=typeof b.referrer==="string"&&/^[a-z0-9.-]{1,253}$/i.test(b.referrer)?b.referrer.toLowerCase():"";
  const {error}=await createAdminClient().from("site_page_views").insert({id:b.id,host,path,session_hash,referrer_host:referrer===host?"":referrer,device:b.device});
  if(error&&error.code!=="23505")return NextResponse.json({error:"VISITS_UNAVAILABLE"},{status:503});
  return new NextResponse(null,{status:204});
 }catch{return NextResponse.json({error:"INVALID_VISIT"},{status:400});}
}
