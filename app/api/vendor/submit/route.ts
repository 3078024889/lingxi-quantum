import {NextRequest,NextResponse} from "next/server";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {isVendorSameOrigin} from "../../../../lingxifield-ai-market/lib/vendor-same-origin.mjs";
import {validateVendorSubmission} from "../../../../lingxifield-ai-market/lib/vendor-submission.mjs";
import {POST as verifiedSubmission} from "../../../../lingxifield-ai-market/app/api/vendor/submit/route";

export const dynamic="force-dynamic";

/**
 * Validate the public application before consulting the DB-backed limiter.
 * This preserves the original 400/403 response on malformed, cross-site requests
 * when test environments have no Supabase admin credentials.
 * Valid applications still fail closed when rate-limiting is unavailable.
 */
export async function POST(req:NextRequest){
 if(!isVendorSameOrigin(req))return verifiedSubmission(req);
 const length=Number(req.headers.get("content-length")||0);
 if(!Number.isFinite(length)||length>6500)return verifiedSubmission(req);
 try{
  const raw=await req.clone().text();
  if(Buffer.byteLength(raw,"utf8")>6500)return verifiedSubmission(req);
  const payload:unknown=JSON.parse(raw);
  if(!payload||typeof payload!=="object"||Array.isArray(payload))
   return verifiedSubmission(req);
  const fields=payload as Record<string,unknown>;
  // Existing honeypot and invalid data response remain owned by the original handler.
  if(fields.websiteAddress||!validateVendorSubmission(fields))
   return verifiedSubmission(req);
  // Claim requires full account authorization; public claims must not consume
  // DB rate limits, and the original endpoint returns LOGIN_REQUIRED_MAIN_ACCOUNT.
  if(fields.requestType==="claim")return verifiedSubmission(req);
 }catch{
  return verifiedSubmission(req);
 }
 const guard=await enforceAbuseGuard(req,{scope:"siai-vendor-submission",ipLimit:30,windowSeconds:3600});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:{"Cache-Control":"private, no-store"}});
 return verifiedSubmission(req);
}
