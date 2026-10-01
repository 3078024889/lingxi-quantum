import "server-only";
import{createHash}from"node:crypto";
import{createAdminClient}from"@/lib/supabase/admin";
export type FreeEntitlementKind="image-watermark-daily"|"video-watermark-lifetime"|"video-dubbing-preview";

function ip(req:Request){return(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||req.headers.get("x-real-ip")?.trim()||"unknown").slice(0,128)}
function salt(){return process.env.LINGXIFIELD_PRIVACY_HASH_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY||"lingxifield"}
function hash(v:string){return createHash("sha256").update(`${salt()}:${v}`).digest("hex")}

export async function claimFreeEntitlement(req:Request,userId:string,kind:FreeEntitlementKind){
 const admin=createAdminClient();
 const{data,error}=await admin.rpc("claim_tool_free_entitlement",{
  p_user_id:userId,p_tool_key:kind,p_ip_hash:hash(ip(req)),
  p_usage_day:new Date().toISOString().slice(0,10)
 });
 if(error){console.error("[tool-free-entitlement]",error.code,error.message);return{ok:false as const,error:"ENTITLEMENT_UNAVAILABLE"}}
 return data===true?{ok:true as const}:{ok:false as const,error:"FREE_ENTITLEMENT_USED"};
}
