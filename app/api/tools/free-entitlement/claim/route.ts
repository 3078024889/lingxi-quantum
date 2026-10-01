import{NextRequest,NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{claimFreeEntitlement,type FreeEntitlementKind}from"@/lib/tools/commerce/free-entitlement";
export const runtime="nodejs";
const ALLOWED=new Set<FreeEntitlementKind>(["image-watermark-daily","video-watermark-lifetime","video-dubbing-preview"]);
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const s=createClient(),{data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>null),kind=String(body?.kind||"") as FreeEntitlementKind;
 if(!ALLOWED.has(kind))return NextResponse.json({error:"INVALID_ENTITLEMENT"},{status:400});
 const result=await claimFreeEntitlement(req,user.id,kind);
 return result.ok?NextResponse.json({ok:true}):NextResponse.json({error:result.error},{status:result.error==="FREE_ENTITLEMENT_USED"?409:503});
}
