import {NextRequest,NextResponse} from "next/server";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {isVendorSameOrigin} from "../../../../lingxifield-ai-market/lib/vendor-same-origin.mjs";
import {POST as verifiedSubmission} from "../../../../lingxifield-ai-market/app/api/vendor/submit/route";

export const dynamic="force-dynamic";

/** IP-bounded public application intake; no ownership or listing approval is issued here. */
export async function POST(req:NextRequest){
 // Keep the original handler's same-origin validation; avoid consuming rate-limit
 // buckets for invalid cross-origin requests that it already rejects.
 if(!isVendorSameOrigin(req))return verifiedSubmission(req);
 const guard=await enforceAbuseGuard(req,{scope:"siai-vendor-submission",ipLimit:30,windowSeconds:3600});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:{"Cache-Control":"private, no-store"}});
 return verifiedSubmission(req);
}
