import {NextRequest,NextResponse} from "next/server";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const privateHeaders={"Cache-Control":"private, no-store"};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function owner(){
 try{return await moneyAdministrator();}catch{return null;}
}
export async function GET(){
 const reviewer=await owner();
 if(!reviewer)return NextResponse.json({error:"FORBIDDEN"},{status:403,headers:privateHeaders});
 try{
  const admin=createAdminClient();
  const {data,error,count}=await admin.from("ai_market_vendor_submissions")
   .select("id,project_id,request_type,product_name,official_site,work_email,submitter_name,description,evidence_url,status,verified_domain,created_at,reviewed_at",{count:"exact"})
   .order("created_at",{ascending:false}).limit(100);
  if(error)return NextResponse.json({error:"REVIEW_QUEUE_UNAVAILABLE"},{status:503,headers:privateHeaders});
  return NextResponse.json({total:count??0,rows:data??[]},{headers:privateHeaders});
 }catch{return NextResponse.json({error:"REVIEW_QUEUE_UNAVAILABLE"},{status:503,headers:privateHeaders});}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:privateHeaders});
 const reviewer=await owner();
 if(!reviewer)return NextResponse.json({error:"FORBIDDEN"},{status:403,headers:privateHeaders});
 if(Number(req.headers.get("content-length")||0)>1500)return NextResponse.json({error:"TOO_LARGE"},{status:413,headers:privateHeaders});
 const raw=await req.text().catch(()=>"");
 if(Buffer.byteLength(raw,"utf8")>1500)return NextResponse.json({error:"TOO_LARGE"},{status:413,headers:privateHeaders});
 let body:Record<string,unknown>|null=null;
 try{const decoded=JSON.parse(raw);if(decoded&&typeof decoded==="object"&&!Array.isArray(decoded))body=decoded;}catch{}
 if(!body||typeof body.id!=="string"||!uuid.test(body.id)||typeof body.action!=="string"||!["review","reject","approve"].includes(body.action))
  return NextResponse.json({error:"BAD_REQUEST"},{status:400,headers:privateHeaders});
 if(body.action==="approve"&&body.identityVerifiedByHuman!==true)
  return NextResponse.json({error:"IDENTITY_ATTESTATION_REQUIRED"},{status:422,headers:privateHeaders});
 try{
  const admin=createAdminClient();
  const rate=await admin.rpc("rate_limit_check",{p_key:"siai-vendor-review:"+reviewer.id,p_limit:20,p_window_seconds:3600});
  if(rate.error||rate.data!==true)return NextResponse.json({error:"RATE_LIMITED"},{status:429,headers:privateHeaders});
  const {data:existing,error:lookupError}=await admin.from("ai_market_vendor_submissions")
   .select("id,request_type,status,verified_domain,work_email,official_site").eq("id",body.id).single();
  if(lookupError||!existing)return NextResponse.json({error:"NOT_FOUND"},{status:404,headers:privateHeaders});
  if(!["pending_identity_check","pending_review"].includes(existing.status))
   return NextResponse.json({error:"ALREADY_REVIEWED"},{status:409,headers:privateHeaders});
  // The administrator must independently check company ownership and source documents;
  // email/website string matching alone can never establish the vendor identity.
  const nextStatus=body.action==="review"?"pending_review":body.action==="reject"?"rejected":"approved";
  const update={status:nextStatus,verified_domain:body.action==="approve"?true:existing.verified_domain,
   reviewed_by:reviewer.id,reviewed_at:new Date().toISOString()};
  const {data,error}=await admin.from("ai_market_vendor_submissions").update(update)
   .eq("id",existing.id).eq("status",existing.status).select("id,status,reviewed_at").maybeSingle();
  if(error)return NextResponse.json({error:"REVIEW_UPDATE_FAILED"},{status:503,headers:privateHeaders});
  if(!data)return NextResponse.json({error:"CONCURRENT_REVIEW"},{status:409,headers:privateHeaders});
  // Approved status is editorial identity clearance only: no automatic catalog publication,
  // rankings, vendor ownership or payments are changed here.
  return NextResponse.json({row:data,published:false,ownershipGranted:false},{headers:privateHeaders});
 }catch{return NextResponse.json({error:"REVIEW_UNAVAILABLE"},{status:503,headers:privateHeaders});}
}
