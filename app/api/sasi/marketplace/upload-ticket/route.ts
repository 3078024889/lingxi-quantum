import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
export const runtime="nodejs";export const dynamic="force-dynamic";
const nocache={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:nocache});
 if(process.env.SASI_MARKET_UPLOADS_ENABLED!=="true")
  return NextResponse.json({error:"UPLOAD_SCANNING_NOT_READY"},{status:503,headers:nocache});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:nocache});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-market-upload-ticket",userId:user.id,accountLimit:12,ipLimit:50});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:nocache});
 const body=await req.json().catch(()=>null);
 if(!uuid.test(String(body?.listingId||""))||body?.extension!=="zip"||
  !Number.isSafeInteger(body?.fileSize)||body.fileSize<1||body.fileSize>30*1024*1024)
  return NextResponse.json({error:"ZIP_REQUIRED_MAX_30MB"},{status:400,headers:nocache});
 try{
  const admin=createAdminClient();
  const {data:profile}=await admin.from("sasi_market_sellers").select("status").eq("user_id",user.id).single();
  if(profile?.status!=="approved")return NextResponse.json({error:"SELLER_APPROVAL_REQUIRED"},{status:403,headers:nocache});
  const {data:listing}=await admin.from("sasi_market_listings")
   .select("id,quarantine_path,status").eq("id",body.listingId).eq("seller_id",user.id).single();
  if(!listing||listing.status!=="draft"||listing.quarantine_path)
   return NextResponse.json({error:"NEW_DRAFT_REQUIRED"},{status:409,headers:nocache});
  const path=`${user.id}/${listing.id}/${randomUUID()}.zip`;
  const {data,error}=await admin.storage.from("sasi-market-quarantine").createSignedUploadUrl(path);
  if(error||!data)throw Error("PRIVATE_UPLOAD_UNAVAILABLE");
  const {data:reservation,error:updateError}=await admin.from("sasi_market_listings")
    .update({quarantine_path:path}).eq("id",listing.id).eq("seller_id",user.id)
    .is("quarantine_path",null).eq("status","draft").select("id").maybeSingle();
  if(updateError||!reservation)throw Error("UPLOAD_RESERVATION_FAILED");
  return NextResponse.json({path,token:data.token,bucket:"sasi-market-quarantine",maxBytes:31457280},
    {headers:nocache});
 }catch{return NextResponse.json({error:"PRIVATE_UPLOAD_NOT_READY"},{status:503,headers:nocache});}
}
